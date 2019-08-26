require('dotenv').config()

const db = require('../models/index')
const HarvesterService = require('../services/harvester_service')

const harvester = new HarvesterService({
  meetup: {
    consumerKey: process.env.MEETUP_OAUTH_KEY,
    consumerSecret: process.env.MEETUP_OAUTH_SECRET,
    refreshToken: process.env.MEETUP_REFRESH_TOKEN
  }
})

async function harvest() {
  console.log('Fetching all active groups')
  const allActiveGroups = await db.Group.findAll({
    where: {
      active: true,
      blacklisted: false
    }
  })
  console.log(`Found ${allActiveGroups.length} groups...`)
  
  try {
    let allGroupEvents = []
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
        allGroupEvents.forEach((event) => {
          console.log('Event:', event.name)
        })
      })
      .finally(() => {
        console.log('Done.')
      })
  } catch(err) {
    console.log('Harvester Error:', err)
  }
}

harvest()
