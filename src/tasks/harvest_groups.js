require('dotenv').config()

const HarvesterService = require('../services/harvester_service')
const db = require('../models/index')

const harvester = new HarvesterService({
  meetup: {
    consumerKey: process.env.MEETUP_OAUTH_KEY,
    consumerSecret: process.env.MEETUP_OAUTH_SECRET,
    refreshToken: process.env.MEETUP_REFRESH_TOKEN
  }
})

async function harvest () {
  try {
    await harvester.prepareService()

    const allGroups = await harvester.fetchGroups()
    console.log('Total number of groups:', allGroups.meetup.length)

    allGroups.meetup.forEach(item => {
      console.log('Group Name:', item.name)

      db.Group
        .findOrBuild({
          where: {
            platform: 'meetup',
            platform_identifier: `${item.id}`
          }
        })
        .then(([group, created]) => {
          group.update({
            name: item.name,
            platform: 'meetup',
            platform_identifier: `${item.id}`,
            status: item.status,
            link: item.link,
            urlname: item.urlname,
            description: item.description,
            members: item.members
          }).then(() => {
            console.log('Updated the record for ', item.name)
          })
        })
    })
  } catch (error) {
    console.log('Harvest Error:', error)
  }
}

harvest()
