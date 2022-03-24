require('dotenv').config()
const fs = require('fs')

const Sentry = require('@sentry/node')
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN })
}

const db = require('../models/index')

const moment = require('moment-timezone')
const htmlToText = require('html-to-text')

const HarvesterService = require('../services/harvester_service')
const harvester = new HarvesterService()

async function start () {
  console.log(`Starting harvest!`)
  console.log('=====================================================')

  try {
    console.log(`scraping groups from meetup website...`)
    const groupsWithRss = await harvester.fetchGroupsWithRss()
    console.debug(JSON.stringify(groupsWithRss))

    console.log(`grabbing all upcoming events from rss...`)
    const listsOfGroupEvents = await harvester.fetchAllUpcomingEventsFromRss(Object.values(groupsWithRss))

    console.log(`fetching event details for all upcoming events...`)
    const allGroupEvents = await harvester.fetchAllEventDetails(listsOfGroupEvents)
    console.log(`Harvested ${allGroupEvents.length} events`)

    console.log('-----------------------------------------------------')

    for (const item of allGroupEvents) {
      try {
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
        const startTime = moment(`${item.startTime}`)
        const endTime = moment(`${item.endTime}`)

        await event.update({
          name: item.name,
          platform: 'meetup',
          platform_identifier: `${item.id}`,
          description: htmlToText.fromString(item.description),
          location,
          rsvp_count: item.yes_rsvp_count,
          url: item.eventUrl,
          group_id: item.group.id,
          group_name: item.group.name,
          group_url: `https://www.meetup.com/${item.group.urlname}`,
          formatted_time: startTime.tz('Asia/Singapore').format('DD MMM YYYY, ddd, h:mm a'),
          start_time: startTime.toDate().toISOString().slice(0, 19).replace('T', ' '),
          end_time: endTime.toDate().toISOString().slice(0, 19).replace('T', ' '),
          latitude: (item.venue ? item.venue.lat : null),
          longitude: (item.venue ? item.venue.lon : null),
          // In case this event was added, then hidden, then shown again
          active: true
        })

        console.log('Updated the record for', item.name)
      } catch (err) {
        console.warn('DB Error:', err)
        Sentry.captureException(err)
      }
    }
  } catch (err) {
    console.warn('Harvester Error:', err)
    Sentry.captureException(err)
  }
}

start()
