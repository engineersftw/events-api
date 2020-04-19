require('dotenv').config()
const axios = require('axios')

const token = process.env.TELEGRAM_BOT_TOKEN
const chatId = new Number(process.env.TELEGRAM_CHAT_ID)

const db = require('../models/index')
const Op = db.Sequelize.Op
const moment = require('moment-timezone')

async function fetchEvents() {
    const startDate = moment('2020-04-20').hour(0).minute(0)
    const endDate = moment('2020-04-20').hour(23).minute(59)
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

async function push() {
    try {
        const events = await fetchEvents()
        console.log(events)

        if (events.length > 0) {
            const eventListing = events.map(event => {
                return {
                    name: event.name,
                    location: event.location,
                    url: event.url,
                    group_name: event.group_name,
                    group_url: event.group_url,
                    formatted_time: moment(event.start_time).tz('Asia/Singapore').format('DD MMM YYYY, ddd, h:mm a')
                }
            })
            const messages = eventListing.map(event => `😵 [${event.name}](${event.url}) - ${event.formatted_time} - ${event.location}`)
            const header = `*${messages.length} Upcoming Events for ${'2020-04-20'}* `
            const footer = `_Brought to you by Engineers.SG_`

            const finalMessage = header + "\n\n" + messages.join("\n") + "\n" + footer

            const data = {
                "chat_id": chatId,
                "text": finalMessage,
                "parse_mode": "markdown",
                "disable_web_page_preview": true
            }
    
            axios.post(`https://api.telegram.org/bot${token}/sendMessage`, data)
        } else {
            console.error("No events found")
        }
        
    } catch (e) {
        console.log(e)
    }
}

push()
