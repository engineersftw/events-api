const express = require('express')
const router = express.Router()
const debug = require('debug')('app:users')
const db = require('../models/index')

/* GET users listing. */
router.get('/', function (req, res, next) {
  debug('Hello World!')

  db.User.findAll({
    attributes: ['firstName', 'lastName', 'email']
  }).then(users => {
    res.json(users)
  })
})

module.exports = router
