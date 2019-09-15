const db = require('../../models/index')
const Op = db.Sequelize.Op

const moment = require('moment-timezone')
const buildConnection = require('./connection')

async function eventsQueryResolver (parent, args, context, info) {
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

  return buildConnection(db.Event, whereQuery, orderQuery, pageNumber, perPage)
}

async function eventQueryResolver (parent, args, context, info) {
  return db.Event.findByPk(parseInt(args.uid))
}

const eventResolver = {
  uid: parent => parent.id,
  start_time: parent => moment(parent.start_time).tz('Asia/Singapore').format(),
  end_time: parent => moment(parent.end_time).tz('Asia/Singapore').format()
}

module.exports = { eventResolver, eventQueryResolver, eventsQueryResolver }
