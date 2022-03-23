const axios = require('axios')
const Sentry = require('@sentry/node')
const { fetchMeetupGroups } = require('./utils/scraper')
const { getEventDetails } = require('./utils/eventParser')
const { parseRSS } = require('./utils/rssParser')

if (process.env.NODE_ENV === 'development') {
  axios.interceptors.request.use(request => {
    console.debug('Starting Request to:', request.url)
    return request
  })

  axios.interceptors.response.use(response => {
    console.debug('Received response: ', response.status)
    return response
  })
}
class HarvesterService {
  async fetchGroupsWithRss () {
    try {
      return await fetchMeetupGroups()
    } catch (err) {
      console.log('Harvester Error', err)
      Sentry.captureException(err)
    }
  }

  async fetchAllUpcomingEventsFromRss (listOfGroupDetails) {
    const promises = []

    listOfGroupDetails.forEach(groupDetails => {
      promises.push(parseRSS(groupDetails.eventsUrl))
    })

    return Promise.all(promises)
  }

  async fetchAllEventDetails (listsOfGroupEvents) {
    const requestsToMake = []

    listsOfGroupEvents.forEach(groupEventsList => {
      groupEventsList.forEach(event => {
        requestsToMake.push(getEventDetails(event.guid))
      })
    })

    return Promise.all(requestsToMake)
  }
}

module.exports = HarvesterService
