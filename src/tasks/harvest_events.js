require('dotenv').config()

const db = require('../models/index')

const Queue = require('bull')
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const workQueue = new Queue('esg_events', REDIS_URL)

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

    let allJobs = []
    allActiveGroups.forEach(async (group) => {
      console.log(`Adding job for ${group.name}...`)

      const jobDetails = {
        platform: group.platform,
        platform_identifier: group.platform_identifier,
        urlname: group.urlname
      }
      allJobs.push(workQueue.add(jobDetails))
    })

    Promise.all(allJobs)
      .then( allJobResults => {
        console.log('Number of added Jobs:', allJobResults.length)
      })
      .catch( (err) => {
        console.log('Job Add Errors', err)
      })
      .finally( ()=>{
        console.log('Done.')
        workQueue.close()
        db.sequelize.close()
      })
  } catch (err) {
    console.log('Harvester Error:', err)
    workQueue.close()
    db.sequelize.close()
  }
}

harvest()
