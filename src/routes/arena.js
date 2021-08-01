const express = require('express')
const router = express.Router()
const auth = require('http-auth')

const Arena = require('bull-arena')

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const url = require('url')
const Redis = require('ioredis')

const redisUri = url.URL(REDIS_URL)
const redis = new Redis({
  port: Number(redisUri.port) + 1,
  host: redisUri.hostname,
  password: redisUri.auth.split(':')[1],
  db: 0,
  tls: {
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
  }
})

const basic = auth.basic({
  realm: 'Protected Area'
}, function (username, password, callback) {
  // eslint-disable-next-line standard/no-callback-literal
  callback(username === 'admin' && password === process.env.ARENA_PASSWORD)
}
)

const arena = Arena({
  queues: [
    {
      name: 'esg_events',
      hostId: 'main_server',
      url: redis
    }
  ]
})
// @ts-ignore
router.use('/', auth.connect(basic), arena)

module.exports = router
