require('dotenv').config()

const Sentry = require('@sentry/node')
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN })
}

const HarvesterService = require('../services/harvester_service')
const db = require('../models/index')
const MeetupService = require('../services/meetup_service')

const harvester = new HarvesterService({
  meetup: {
    consumerKey: process.env.MEETUP_OAUTH_KEY,
    consumerSecret: process.env.MEETUP_OAUTH_SECRET,
    refreshToken: process.env.MEETUP_REFRESH_TOKEN
  }
})

async function removeUnwantedGroups () {
  console.log('Checking for any unwanted groups')

  const allGroups = await db.Group.findAll({
    attributes: ['platform_identifier', 'name', 'status', 'blacklisted']
  })

  for (const group of allGroups) {
    const isLegit = MeetupService.isLegit(group)
    if (!isLegit) {
      console.log(`Removing blacklisted group '${group.name}' link: '${group.link}'`)
      await group.destroy()
    }
  }
}

async function harvest () {
  try {
    await harvester.prepareService()

    const allGroups = await harvester.fetchGroups()
    console.log('Total number of groups:', allGroups.meetup.length)

    for (const item of allGroups.meetup) {
      console.log('Group Name:', item.name)

      /*
      if (removeGroup) {
        await db.Group.destroy({
          where: {
            platform: 'meetup',
            platform_identifier: `${item.id}`
          }
        })
        return
      }
      */

      await db.Group
        .findOrBuild({
          where: {
            platform: 'meetup',
            platform_identifier: `${item.id}`
          }
        })
        .then(([group, created]) => {
          return group.update({
            name: item.name,
            platform: 'meetup',
            platform_identifier: `${item.id}`,
            status: item.status,
            link: item.link,
            urlname: item.urlname,
            description: item.description,
            members: item.members,
            blacklisted: !MeetupService.isLegit(item)
          }).then(() => {
            console.log('Updated the record for ', item.name)
          })
        })
    }
  } catch (err) {
    console.log('Harvest Error:', err)
    Sentry.captureException(err)
    db.sequelize.close()
  }
}

removeUnwantedGroups().then(async () => {
  await harvest()
}).catch(err => {
  console.log('Main Harvest Error:', err)
  Sentry.captureException(err)
  db.sequelize.close()
})
