const express = require('express')
const router = express.Router()
const MeetupService = require('../services/meetup_service')

const meetupService = new MeetupService({
  consumerKey: process.env.MEETUP_OAUTH_KEY,
  consumerSecret: process.env.MEETUP_OAUTH_SECRET,
  redirectUri: process.env.MEETUP_REDIRECT_URI
})

/* GET users listing. */
router.get('/', function (req, res, next) {
  const authorizeUrl = meetupService.authorizeLink()
  res.redirect(authorizeUrl)
})

router.get('/auth', async function (req, res, next) {
  const { code } = req.query
  const accessTokenResponse = await meetupService.fetchAccessToken(code)

  res.json(accessTokenResponse)
})

module.exports = router
