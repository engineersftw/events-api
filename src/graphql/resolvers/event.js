const db = require('../../models/index')
const Op = db.Sequelize.Op

const moment = require('moment-timezone')
const buildConnection = require('./connection')
const uuidv1 = require('uuid/v1')

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

async function createEventMutationResolver (parent, args, context, info) {
  const { event } = args

  const startTime = moment.tz(event.start_time, 'Asia/Singapore')
  const endTime = moment.tz(event.end_time, 'Asia/Singapore')

  event.start_time = startTime.toDate()
  event.end_time = endTime.toDate()
  event.formatted_time = startTime.format('DD MMM YYYY, ddd, h:mm a')

  event.platform = 'esg'
  event.platform_identifier = uuidv1()

  event.active = true

  const newEvent = await db.Event.create(event)

  return newEvent
}

module.exports = { eventResolver, eventQueryResolver, eventsQueryResolver, createEventMutationResolver }
