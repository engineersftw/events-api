require('dotenv').config()

const Sentry = require('@sentry/node')
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN })
}

const throng = require('throng')

const Queue = require('bull')
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const url = require('url')
const Redis = require('ioredis')

const redisUri = url.URL(REDIS_URL)
const redis = new Redis({
  port: Number(redisUri.port) + 1,
  host: redisUri.hostname,
  password: redisUri.auth.split(':')[1],
  db: 0,
  tls: {
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
  }
})

// Warning: If I set this above 1, I see a lot of "401 Unauthorized" reponses.
// I think this is because each worker requests a separate access token, but only the last requested token is valid.
const workers = process.env.WEB_CONCURRENCY || 1

// I don't recommend setting this above 8.  Their rate limiter might kick in before ours, resulting in jobs that run but don't succeed.
const maxJobsPerWorker = 1

const db = require('../models/index')

const HarvesterService = require('../services/harvester_service')
const moment = require('moment-timezone')

const htmlToText = require('html-to-text')

async function deactivateHiddenEvents (groupId, allGroupEvents) {
  // Look for upcoming events for this group in the DB which are no longer
  // present in the list provided by meetup, and set them as hidden.
  //
  // (Unhiding of events which have become visible again will be done by the
  // main process.)

  const dbEvents = await db.Event.findAll({
    where: {
      platform: 'meetup',
      group_id: groupId,
      active: true
      // We only want to consider future events, because our meetup query does
      // not return past events, so we would hide all past events for no reason!
      // These queries did not work for me, so instead I do this filter in JS below.
      // start_time: { $gt: new Date() }
      // start_time: { $gt: moment().toDate() }
    }
  })
  const futureDBEvents = dbEvents.filter(event => Number(event.start_time) > Date.now())

  // This is O(n) but since n < 100, this should be acceptable
  const isVisibleOnPlatform = (event) => allGroupEvents.some(item => item.id === event.platform_identifier)

  for (const event of futureDBEvents) {
    if (!isVisibleOnPlatform(event)) {
      console.log(`Hiding event '${event.name}' id '${event.platform_identifier}' from group '${groupId}' because it is no longer visible on meetup.com (see ${event.url})`)
      await event.update({ active: false })
    }
  }
}

function start () {
  const harvester = new HarvesterService({
    meetup: {
      consumerKey: process.env.MEETUP_OAUTH_KEY,
      consumerSecret: process.env.MEETUP_OAUTH_SECRET,
      refreshToken: process.env.MEETUP_REFRESH_TOKEN
    }
  })

  const workQueue = new Queue('esg_events', redis)

  workQueue.process(maxJobsPerWorker, async (job, done) => {
    console.log('=====================================================')

    try {
      // This code doesn't seem quite right, because all jobs share one
      // harvester. (Workers fork into separate processes, but jobs do not.)
      //
      // So when maxJobsPerWorker = 20, then 20 jobs will call
      // harvester.prepareService() in parallel, all on the same harvester!
      //
      // And then they will call harvester.fetchGroupEvents() all on the same
      // harvester, all now using the same access token (the last one
      // generated)!
      //
      // We could move the harvester constructor inside this function, but even
      // then my rate limit was dropping too quickly.
      //
      // So I dropped maxJobsPerWorker to 1.
      //
      await harvester.prepareService()

      const eventResponses = await harvester.fetchGroupEvents(job.data)
      const allGroupEvents = eventResponses.events
      console.log(`Harvested ${allGroupEvents.length} events from ${job.data.urlname}`)

      await deactivateHiddenEvents(job.data.platform_identifier, allGroupEvents)

      console.log('-----------------------------------------------------')

      for (const item of allGroupEvents) {
        console.log(`Event: '${item.name}' (${item.link})`)

        const [event, created] = await db.Event.findOrBuild({
          where: {
            platform: 'meetup',
            platform_identifier: `${item.id}`
          }
        })

        let location = ''
        if (item.venue) {
          location = item.venue.name

          if (item.venue.address_1) {
            location += `, ${item.venue.address_1}`
          }
        }

        const startTime = moment(`${item.local_date} ${item.local_time} +08:00`, 'YYYY-MM-DD HH:mm Z')
        const endTime = moment(startTime).add(item.duration, 'milliseconds')

        await event.update({
          name: item.name,
          platform: 'meetup',
          platform_identifier: `${item.id}`,
          description: htmlToText.fromString(item.description),
          location: location,
          rsvp_count: item.yes_rsvp_count,
          url: item.link,
          group_id: item.group.id,
          group_name: item.group.name,
          group_url: `https://www.meetup.com/${item.group.urlname}`,
          formatted_time: startTime.tz('Asia/Singapore').format('DD MMM YYYY, ddd, h:mm a'),
          start_time: startTime.toDate(),
          end_time: endTime.toDate(),
          latitude: (item.venue ? item.venue.lat : null),
          longitude: (item.venue ? item.venue.lon : null),
          // In case this event was added, then hidden, then shown again
          active: true
        })

        console.log('Updated the record for', item.name)
      }

      done()
    } catch (err) {
      console.log('Harvester Error:', err)
      Sentry.captureException(err)
      done(err)
    }
  })
}

throng({ workers, start })
