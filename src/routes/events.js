const express = require('express')
const router = express.Router()

const db = require('../models/index')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const moment = require('moment')
// const ical = require('ical-generator')

async function fetchEvents (startDate) {
  return db.Event
    .findAll({
      where: {
        active: true,
        start_time: {
          [Op.gte]: startDate.toDate()
        }
      },
      order: [
        ['start_time', 'ASC']
      ]
    })
}

/* List all events */
router.get('/', async function (req, res, next) {
  const startDate = moment().hour(0).minute(0)
  const events = await fetchEvents(startDate)

  const eventListing = events.map(event => {
    return {
      id: event.platform_identifier,
      name: event.name,
      description: event.description,
      location: event.location,
      url: event.url,
      group_id: event.group_id,
      group_name: event.group_name,
      group_url: event.group_url,
      formatted_time: event.formatted_time,
      unix_start_time: moment(event.start_time).unix(),
      start_time: event.start_time,
      end_time: event.end_time,
      platform: event.platform,
      rsvp_count: event.rsvp_count
    }
  })

  res.json({
    meta: {
      generated_at: moment().toISOString(),
      location: 'Singapore',
      api_version: 'v1',
      total_events: events.length
    },
    events: eventListing
  })
})

module.exports = router
