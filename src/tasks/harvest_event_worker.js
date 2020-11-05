require('dotenv').config()

const Sentry = require('@sentry/node')
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN })
}

const throng = require('throng')

const Queue = require('bull')
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

const workers = process.env.WEB_CONCURRENCY || 1
const maxJobsPerWorker = 20

const db = require('../models/index')

const HarvesterService = require('../services/harvester_service')
const moment = require('moment-timezone')

const htmlToText = require('html-to-text')

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
    try {
      const allGroupEvents = []
      await harvester.prepareService()

      await Promise.all([harvester.fetchGroupEvents(job.data)])
        .then((allEventResponses) => {
          allEventResponses.forEach((eventResponse) => {
            allGroupEvents.push(...eventResponse.events)
          })

          console.log('=====================================================')
          console.log(`Harvested ${allGroupEvents.length} events from ${job.data.urlname}`)
          allGroupEvents.forEach((item) => {
            console.log('Event:', item.name)

            db.Event
              .findOrBuild({
                where: {
                  platform: 'meetup',
                  platform_identifier: `${item.id}`
                }
              })
              .then(([event, created]) => {
                let location = ''
                if (item.venue) {
                  location = item.venue.name

                  if (item.venue.address_1) {
                    location += `, ${item.venue.address_1}`
                  }
                }

                const startTime = moment(`${item.local_date} ${item.local_time} +08:00`, 'YYYY-MM-DD HH:mm Z')
                const endTime = moment(startTime).add(item.duration, 'milliseconds')

                event.update({
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
                }).then(() => {
                  console.log('Updated the record for', item.name)
                })
              })
          })
          done()
        })
    } catch (err) {
      console.log('Harvester Error:', err)
      Sentry.captureException(err)
      done(err)
    }
  })
}

throng({ workers, start })
