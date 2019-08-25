const MeetupService = require('../meetup_service')

class MeetupHarvester {
  constructor (options = {}) {
    this.consumerKey = options.consumerKey
    this.consumerSecret = options.consumerSecret
    this.refreshToken = options.refreshToken
  }

  async prepareService () {
    try {
      this.meetupService = new MeetupService({
        consumerKey: this.consumerKey,
        consumerSecret: this.consumerSecret
      })

      const newTokenResponse = await this.meetupService.refreshToken(this.refreshToken)
      if (!newTokenResponse) {
        throw new Error('Unable to refresh token')
      }
      const newAccessToken = newTokenResponse.access_token
      this.meetupService.setAccessToken(newAccessToken)
    } catch (err) {
      console.log('Prepare Service Error', err)
    }
  }

  async fetchGroups () {
    let offset = 0
    const allGroups = []
    let groupsResponse

    while (true) {
      groupsResponse = await this.meetupService.fetchApi('/find/groups', {
        country: 'SG',
        location: 'Singapore',
        fields: 'topics',
        category: 34,
        page: 200,
        offset: offset
      })

      if (groupsResponse.status === 200) {
        const groups = groupsResponse.data

        allGroups.push(...groups)

        if (allGroups.length >= parseInt(groupsResponse.headers['x-total-count'])) {
          break
        }

        offset++
      } else {
        break
      }
    }

    return allGroups
  }

  async fetchGroupEvents (group) {
    let offset = 0
    const allEvents = []
    let groupsEventsResponse

    while (true) {
      groupsEventsResponse = await this.meetupService.fetchApi(`/${group.urlname}/events`, {
        page: 200,
        offset: offset
      })

      if (groupsEventsResponse.status === 200) {
        const groups = groupsEventsResponse.data

        allEvents.push(...groups)

        if (allEvents.length >= parseInt(groupsEventsResponse.headers['x-total-count'])) {
          break
        }

        offset++
      } else {
        break
      }
    }

    return allEvents
  }
}

module.exports = MeetupHarvester
