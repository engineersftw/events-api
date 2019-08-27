require('dotenv').config()

const db = require('../models/index')
const HarvesterService = require('../services/harvester_service')
const moment = require('moment')

const harvester = new HarvesterService({
  meetup: {
    consumerKey: process.env.MEETUP_OAUTH_KEY,
    consumerSecret: process.env.MEETUP_OAUTH_SECRET,
    refreshToken: process.env.MEETUP_REFRESH_TOKEN
  }
})

async function harvest () {
  console.log('Fetching all active groups')
  const allActiveGroups = await db.Group.findAll({
    where: {
      active: true,
      blacklisted: false
    }
  })
  console.log(`Found ${allActiveGroups.length} groups...`)

  try {
    const allGroupEvents = []
    await harvester.prepareService()

    const eventHarvesters = []

    allActiveGroups.forEach(async (group) => {
      console.log(`Fetching events for ${group.name}...`)
      eventHarvesters.push(harvester.fetchGroupEvents(group))
    })

    Promise.all(eventHarvesters)
      .then((allEventResponses) => {
        allEventResponses.forEach((eventResponse) => {
          allGroupEvents.push(...eventResponse.events)
        })

        console.log(`Harvested ${allGroupEvents.length} events in total`)
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
                description: item.description,
                location: location,
                rsvp_count: item.yes_rsvp_count,
                url: item.link,
                group_id: item.group.id,
                group_name: item.group.name,
                group_url: `https://www.meetup.com/${item.group.urlname}`,
                formatted_time: startTime.format('DD MMM YYYY, ddd, h:mm a'),
                start_time: startTime.toDate(),
                end_time: endTime.toDate(),
                latitude: (item.venue ? item.venue.lat : null),
                longitude: (item.venue ? item.venue.lon : null)
              }).then(() => {
                console.log('Updated the record for ', item.name)
              })
            })
        })
      })
      .finally(() => {
        console.log('Done.')
      })
  } catch (err) {
    console.log('Harvester Error:', err)
  }
}

harvest()
