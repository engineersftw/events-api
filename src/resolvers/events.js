const db = require('../models/index')
const Op = db.Sequelize.Op

const moment = require('moment-timezone')
const buildEventConnection = require('./event_connection')

async function eventsResolver (parent, args, context, info) {
  let { pageNumber, perPage } = args

  if (perPage === null) {
    perPage = 50
  }

  const startDate = moment().hour(0).minute(0)

  const whereQuery = {
    active: true,
    start_time: {
      [Op.gte]: startDate.toDate()
    }
  }
  const orderQuery = [
    ['start_time', 'ASC']
  ]

  return buildEventConnection(db.Event, whereQuery, orderQuery, pageNumber, perPage)
}

module.exports = eventsResolver
