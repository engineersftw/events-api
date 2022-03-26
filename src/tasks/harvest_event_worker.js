require('dotenv').config()

const Sentry = require('@sentry/node')
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN })
}

const harvester = require('../services/harvester_service')

async function start () {
  console.log(`Starting harvest!`)
  console.log('=====================================================')
  harvester.saveEventsIntoDB()
}

start()
