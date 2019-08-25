const MeetupService = require('../services/meetup_service')
const debug = require('debug')('app:harvest_service')

class HarvesterService {
  constructor(options = {}) {
    this.meetup = options.meetup
  }

  async prepareService() {
    try {
      this.meetupService = new MeetupService({
        consumerKey: this.meetup.consumerKey,
        consumerSecret: this.meetup.consumerSecret
      })
      
      const newTokenResponse = await this.meetupService.refreshToken(this.meetup.refreshToken)
      if (!newTokenResponse) {
        throw new Error('Unable to refresh token')
      }
      const newAccessToken = newTokenResponse.access_token
      this.meetupService.setAccessToken(newAccessToken)

    } catch(err) {
      console.log('Prepare Service Error', err)
    }
  }

  async fetchGroups() {
    let offset = 0
    let page = 1
    let allGroups = []
    let groupsResponse
  
    while(true) {
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
  
        page++
        offset++
      } else {
        break
      }
    }
    
    return allGroups
  }
}

module.exports = HarvesterService