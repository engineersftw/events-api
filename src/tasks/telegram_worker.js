require('dotenv').config()
const axios = require('axios')

const token = process.env.TELEGRAM_BOT_TOKEN
const chatId = new Number(process.env.TELEGRAM_CHAT_ID)

const db = require('../models/index')
const Op = db.Sequelize.Op
const moment = require('moment-timezone')

async function fetchEvents (date) {
  const startDate = date.hour(0).minute(0)
  const endDate = moment(date).hour(23).minute(59)
  return db.Event
    .findAll({
      where: {
        active: true,
        start_time: {
          [Op.gte]: startDate.toDate(),
          [Op.lt]: endDate.toDate()
        }
      },
      order: [
        ['start_time', 'ASC']
      ]
    })
}

function filterEvents (event) {
  // no offense but these groups aren't tech related
  return (event.group_name !== 'Kakis SG Anything Watever Meetup Group') &&
        (event.group_name !== 'EMF & Wireless Radiation Safety')
}

function processEvents (events) {
  const eventListing = events.map(event => {
    return {
      name: event.name,
      location: event.location,
      url: event.url,
      group_name: event.group_name,
      group_url: event.group_url,
      formatted_time: moment(event.start_time).tz('Asia/Singapore').format('h:mm a')
    }
  })
    .filter(filterEvents)
    .filter((event, index, self) => {
      // deduplicates events
      return index === self.findIndex((e) => (
        e.name === event.name &&
        e.location === event.location &&
        e.url === event.url &&
        e.group_name === event.group_name &&
        e.formatted_time === event.formatted_time
      ))
    })

  return eventListing
}

async function push () {
  try {
    const dateToQuery = moment().add(1, 'day')
    const formattedDateToQuery = dateToQuery.format('YYYY-MM-DD')
    const events = await fetchEvents(dateToQuery)
    console.log(events)

    if (events.length > 0) {
      const eventListing = processEvents(events)

      const messages = eventListing.map(event => `⏰ ${event.formatted_time} - [${event.name}](${event.url}) (${event.group_name}) - 📍${event.location}`)
      const header = `*🗓 ${messages.length} Upcoming Events for ${dateToQuery.format('DD MMM YYYY, ddd')}* `
      const footer = `_Brought to you by Engineers.SG_`

      const finalMessage = header + '\n\n' + messages.join('\n') + '\n\n' + footer

      const data = {
        chat_id: chatId,
        text: finalMessage,
        parse_mode: 'markdown',
        disable_web_page_preview: true
      }
      axios.post(`https://api.telegram.org/bot${token}/sendMessage`, data)
    } else {
      const data = {
        chat_id: chatId,
        text: `No events found for ${formattedDateToQuery}`
      }
      axios.post(`https://api.telegram.org/bot${token}/sendMessage`, data)
      console.error(`No events found for ${formattedDateToQuery}`)
    }
  } catch (e) {
    console.log(e)
  }
}

push()

exports.filterEvents = filterEvents
exports.processEvents = processEvents
