const axios = require('axios')
const { JSDOM } = require('jsdom')

const getEventDetails = async (eventGuid) => {
  const response = await axios.get(eventGuid)
  if (response.status !== 200) {
    return
  }
  const { data } = response
  const dom = new JSDOM(data)
  try {
    const nextData = JSON.parse(dom.window.document.getElementById('__NEXT_DATA__').innerHTML)

    const {
      id,
      title,
      eventUrl,
      description,
      dateTime,
      endTime,
      isOnline,
      group,
      venue,
      howToFindUs,
      going
    } = nextData.props.pageProps.event

    return {
      id,
      name: title,
      eventUrl,
      description,
      startTime: dateTime,
      endTime: endTime,
      isOnline,
      url: eventGuid,
      group,
      venue,
      howToFindUs,
      yes_rsvp_count: going
    }
  } catch (err) {
    console.error(`Event ${eventGuid} met error. ${err}`)
  }
}

module.exports = { getEventDetails }
