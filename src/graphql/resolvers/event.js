const db = require('../../models/index')
const Op = db.Sequelize.Op

const moment = require('moment-timezone')
const buildConnection = require('./connection')
const uuidv1 = require('uuid/v1')
const { mutationResponse } = require('./mutationResponse')

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
  if (!context.user) {
    return mutationResponse('500', false, 'User not found')
  }

  const { event } = args

  try {
    const startTime = moment.tz(event.start_time, 'Asia/Singapore')
    const endTime = moment.tz(event.end_time, 'Asia/Singapore')

    event.start_time = startTime.toDate()
    event.end_time = endTime.toDate()
    event.formatted_time = startTime.format('DD MMM YYYY, ddd, h:mm a')

    event.platform = 'esg'
    event.platform_identifier = uuidv1()

    event.active = true

    const newEvent = await db.Event.create(event)

    return mutationResponse('200', true, 'Event created successfully', { event: newEvent })
  } catch (err) {
    mutationResponse('500', false, err.message)
  }

  return mutationResponse('500', false, 'Unknown error')
}

module.exports = { eventResolver, eventQueryResolver, eventsQueryResolver, createEventMutationResolver }
