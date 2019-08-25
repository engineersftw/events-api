require('dotenv').config()

const HarvesterService = require('../services/harvester_service')

const harvester = new HarvesterService({
  meetup: {
    consumerKey: process.env.MEETUP_OAUTH_KEY,
    consumerSecret: process.env.MEETUP_OAUTH_SECRET,
    refreshToken: process.env.MEETUP_REFRESH_TOKEN
  }
})

async function harvest() {
  try {
    await harvester.prepareService()
  
    let allGroups = await harvester.fetchGroups()
    console.log('Total number of groups:', allGroups.length)

    allGroups.forEach( item => {
      console.log('Group Name:', item.name)
    })

  } catch (error) {
    console.log("Harvest Error:", error)
  }
}

harvest()
