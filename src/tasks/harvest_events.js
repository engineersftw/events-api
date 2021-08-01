require('dotenv').config()

const Sentry = require('@sentry/node')
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN })
}

const db = require('../models/index')

const Queue = require('bull')

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const url = require('url')
const Redis = require('ioredis')

const redisUri = new url.URL(REDIS_URL)
const redisOpt = {
  port: Number(redisUri.port) + 1,
  host: redisUri.hostname,
  db: 0,
  tls: {
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
  }
}

if (redisUri.auth) {
  redisOpt['password'] = redisUri.auth.split(':')[1]
}

const redis = new Redis(redisOpt)

const workQueue = new Queue('esg_events', redis)
const delayInterval = parseInt(process.env.EVENT_WORKER_DELAY_INTERVAL) || 12000
const batchSize = parseInt(process.env.EVENT_WORKER_BATCH_SIZE) || 25

async function harvest () {
  console.log('Fetching all active groups')
  try {
    const allActiveGroups = await db.Group.findAll({
      where: {
        active: true,
        blacklisted: false
      }
    })
    console.log(`Found ${allActiveGroups.length} groups...`)

    let currentDelay = 0
    const allJobs = allActiveGroups.map(async (group, index) => {
      console.log(`Adding job for ${group.name}...`)

      console.log('Index', index)
      if (((index + 1) % batchSize) === 0) {
        currentDelay += delayInterval
        console.log('Delay increased:', currentDelay)
      }

      const jobDetails = {
        platform: group.platform,
        platform_identifier: group.platform_identifier,
        urlname: group.urlname
      }
      return workQueue.add(jobDetails, { delay: currentDelay, removeOnComplete: true, attempts: 3 })
    })

    await Promise.all(allJobs)
      .then(allJobResults => {
        console.log('Number of added Jobs:', allJobResults.length)
      })
      .catch((err) => {
        console.log('Job Add Errors', err)
      })
      .finally(() => {
        console.log('Done.')
        workQueue.close()
      })
  } catch (err) {
    console.log('Harvester Error:', err)
    Sentry.captureException(err)
    workQueue.close()
  }
}
async function checkExistingEvents () {
  console.log('Checking for any unwanted events')

  // We need to find all events whose group has been removed from the Groups table.
  //   SELECT * from Events e WHERE e.group_id NOT IN (SELECT platform_identifier from public."Groups");
  // But I couldn't work out how to execute that through Sequelize.
  // So instead I fetch all the groups and all the events, and process them in JavaScript!
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
    const hasParentGroup = !!group
    const isBlacklisted = group && group.blacklisted
    return hasParentGroup && !isBlacklisted
  }

  for (const event of allEvents) {
    const shouldBeActive = isLegitEvent(event)
    // We deactivate events from groups which have disappeared or been blacklisted.
    // We don't re-activate any events here.  That is done in harvest_event_worker.js
    if (event.active && !shouldBeActive) {
      console.log(`Changing active status of event from ${event.active} to ${shouldBeActive}: '${event.url}'`)
      await event.update({
        active: shouldBeActive
      })
    }
  }
}

(async () => {
  await harvest()
  await checkExistingEvents()
})()
  .finally(() => {
    db.sequelize.close()
  })
  .catch(err => {
    console.log('Harvest Events Error:', err)
    Sentry.captureException(err)
    db.sequelize.close()
  })
