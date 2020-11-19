require('dotenv').config()

const Sentry = require('@sentry/node')
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN })
}

const HarvesterService = require('../services/harvester_service')
const db = require('../models/index')
const MeetupService = require('../services/meetup_service')
// @ts-ignore We exported that function on the router, until we find a more suitable place to put it
const { blackListGroup } = require('../routes/groups')

const harvester = new HarvesterService({
  meetup: {
    consumerKey: process.env.MEETUP_OAUTH_KEY,
    consumerSecret: process.env.MEETUP_OAUTH_SECRET,
    refreshToken: process.env.MEETUP_REFRESH_TOKEN
  }
})

async function checkExistingGroups () {
  // Checks whether the blacklisted status of existing groups should be changed (e.g. after the filters were updated)
  console.log('Checking the blacklisted state of existing groups')

  const allGroups = await db.Group.findAll({})

  for (const group of allGroups) {
    const isLegit = MeetupService.isLegit(group)
    const shouldBeBlacklisted = !isLegit
    if (group.blacklisted !== shouldBeBlacklisted) {
      console.log(`Changing blacklisted status of group from ${group.blacklisted} to ${shouldBeBlacklisted}: ${group.link}`)
      await blackListGroup(group, shouldBeBlacklisted)
    }
  }
}

async function harvest () {
  try {
    console.log('=====================================================')

    await harvester.prepareService()

    const allGroups = await harvester.fetchGroups()
    console.log('Total number of groups:', allGroups.meetup.length)

    for (const item of allGroups.meetup) {
      console.log('Group Name:', item.name)

      const [group, created] = await db.Group
        .findOrBuild({
          where: {
            platform: 'meetup',
            platform_identifier: `${item.id}`
          }
        })

      await group.update({
        name: item.name,
        platform: 'meetup',
        platform_identifier: `${item.id}`,
        status: item.status,
        link: item.link,
        urlname: item.urlname,
        description: item.description,
        members: item.members,
        blacklisted: !MeetupService.isLegit(item)
      })

      console.log('Updated the record for ', item.name)
    }
  } catch (err) {
    console.log('Harvest Error:', err)
    Sentry.captureException(err)
    db.sequelize.close()
  }
}

checkExistingGroups().then(async () => {
  await harvest()
}).catch(err => {
  console.log('Main Harvest Error:', err)
  Sentry.captureException(err)
  db.sequelize.close()
})
