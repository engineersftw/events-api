const moment = require('moment-timezone')
const htmlToText = require('html-to-text')
const Sentry = require('@sentry/node')
const { fetchMeetupGroups } = require('./utils/scraper')
const { getEventDetails } = require('./utils/eventParser')
const { parseRSS, getRssUrlForGroup } = require('./utils/rssParser')
const { getGroupDetails } = require('./utils/groupParser')

const db = require('../models/index')
class HarvesterService {
  async fetchGroups ({ pageNumber }) {
    try {
      return await fetchMeetupGroups({ pageNumber })
    } catch (err) {
      console.log('Harvester Error', err)
      Sentry.captureException(err)
    }
  }

  async fetchAllUpcomingEventsFromRss (rssUrls) {
    const promises = []

    rssUrls.forEach(rssUrl => {
      promises.push(parseRSS(rssUrl))
    })

    return Promise.all(promises)
  }

  async fetchAllEventDetails (listsOfGroupEvents) {
    const requestsToMake = []

    listsOfGroupEvents.forEach(groupEventsList => {
      groupEventsList.forEach(event => {
        requestsToMake.push(getEventDetails(event.guid))
      })
    })

    return Promise.all(requestsToMake)
  }

  async saveFetchedGroupsInDB (fetchedGroups) {
    let fetchedExistingGroups = false
    const promises = Object.values(fetchedGroups).map(item => getGroupDetails(item.groupUrl))
    const fetchedGroupDetails = await Promise.all(promises)

    console.debug(`Finished fetching groups...`)
    for await (const groupDetails of fetchedGroupDetails) {
      try {
        // eslint-disable-next-line camelcase
        const { platform_identifier } = groupDetails
        const [group, created] = await db.Group.findOrBuild({
          where: {
            platform: 'meetup',
            platform_identifier: platform_identifier
          }
        })

        if (created) {
          console.debug('Found a group that already exists in current DB.')
          fetchedExistingGroups = created
        }
        await group.update(groupDetails)
      } catch (err) {
        console.warn('Failed to update group for:', err)
        Sentry.captureException(err)
      }
    }

    return fetchedExistingGroups
  }

  async fetchAndSaveItemsInDB () {
    console.log(`Scraping newest groups from meetup website...`)
    let fetchedExistingGroups = false
    let pageNumber = 0
    while (!fetchedExistingGroups) {
      console.log(`Fetching 100 groups for page number ${pageNumber}`)
      const fetchedGroups = await this.fetchGroups({ pageNumber })

      fetchedExistingGroups = await this.saveFetchedGroupsInDB(fetchedGroups)
      console.debug(`Updated records for a total of ${100 * (pageNumber + 1)} groups`)
      if (fetchedExistingGroups) {
        console.debug('Among the current list of 100 groups, some already exists in current DB. Harvester will stop scraping for newer groups.')
        break
      } else {
        console.debug(`Continuing scraping for the next 100 newest groups...`)
        pageNumber += 1
      }
    }

    console.log('-----------------------------------------------------')
    console.log(`Grabbing all upcoming events from rss...`)
    const groupsInDB = await db.Group.findAll({ where: { platform: 'meetup', blacklisted: false }, raw: true })
    const rssUrls = groupsInDB.map(group => getRssUrlForGroup(group.link))
    console.log({ rssUrls })
    const listsOfGroupEvents = await this.fetchAllUpcomingEventsFromRss(rssUrls)

    console.log(`Fetching event details for all upcoming events...`)
    const allGroupEvents = await this.fetchAllEventDetails(listsOfGroupEvents)
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
  }

  catch (err) {
    console.warn('Harvester error, failed to update events:', err)
    Sentry.captureException(err)
  }
}

module.exports = new HarvesterService()
