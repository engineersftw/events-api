const express = require('express')
const router = express.Router()
const auth = require('http-auth')

const Arena = require('bull-arena');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

const basic = auth.basic({
        realm: "Protected Area"
    }, function (username, password, callback) {
        callback(username === "admin" && password === process.env.ARENA_PASSWORD);
    }
);

const arena = Arena({
  queues: [
    {
      "name": "esg_events",
      "hostId": "main_server",
      "url": REDIS_URL
    }
  ]
});
router.use('/', auth.connect(basic), arena);

module.exports = router
