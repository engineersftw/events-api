require('dotenv').config()

const Sentry = require('@sentry/node')
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN })
}

const throng = require('throng')

const Queue = require('bull')
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

const workers = process.env.WEB_CONCURRENCY || 1
const maxJobsPerWorker = 1

const db = require('../models/index')

const HarvesterService = require('../services/harvester_service')
const moment = require('moment-timezone')

const htmlToText = require('html-to-text')

// A bit of a hack, to ensure checkExistingEvents() only runs once, not in every worker
const isRootWorker = !process.env.CHILD_WORKER
// Let any processes forked from this one know that they are children
process.env.CHILD_WORKER = 'true'

async function checkExistingEvents () {
  if (!isRootWorker) {
    return
  }

  console.log('Checking for any unwanted events')

  // We need to find all events whose group has been removed from the Groups table.
  //   SELECT * from Events e WHERE e.group_id NOT IN (SELECT platform_identifier from public."Groups");
  // But I couldn't work out how to execute that through Sequelize.
  // So instead I fetch everything in JavaScript, and then process it.
  //
  // I also implement an additional rule: Remove events whose group.blacklisted === true

  const allGroups = await db.Group.findAll({})
  const groupsById = {}
  allGroups.forEach(group => {
    groupsById[group.platform_identifier] = group
  })

  const allEvents = await db.Event.findAll({
    attributes: ['id', 'name', 'url', 'group_id', 'group_name', 'active']
  })

  const isLegitEvent = (event) => {
    const group = groupsById[event.group_id]
    const isOrphaned = !group
    const isBlacklisted = group && group.blacklisted
    return !isOrphaned && !isBlacklisted
  }

  for (const event of allEvents) {
    const shouldBeActive = isLegitEvent(event)
    if (event.active !== shouldBeActive) {
      console.log(`Changing active status of event from ${event.active} to ${shouldBeActive}: '${event.url}'`)
      await event.update({
        active: shouldBeActive
      })
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

  const workQueue = new Queue('esg_events', REDIS_URL)

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

      for (const item of allGroupEvents) {
        console.log('Event:', item.name)

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
          longitude: (item.venue ? item.venue.lon : null)
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

checkExistingEvents().then(() => {
  throng({ workers, start })
}).catch(err => {
  console.log('Main Harvester Error:', err)
  Sentry.captureException(err)
})
