jest.setTimeout(30000)

const HarvesterService = require('./harvester_service')
const nockVCR = require('../../test/nock_vcr')

let service

beforeEach(() => {
  service = new HarvesterService({
    meetup: {
      consumerKey: process.env.MEETUP_OAUTH_KEY,
      consumerSecret: process.env.MEETUP_OAUTH_SECRET,
      refreshToken: process.env.MEETUP_REFRESH_TOKEN
    }
  })
})

describe('HarvesterService', () => {
  test('#fetchGroups', () => {
    return nockVCR('allGroups.json', async () => {
      await service.prepareService()
      const allGroups = await service.fetchGroups()
      expect(allGroups.meetup.length).toEqual(667)
    })
  })

  test('#fetchGroupEvents', () => {
    return nockVCR('groupEvents.json', async () => {
      const group = { urlname: 'SGInnovate', platform: 'meetup' }
      await service.prepareService()
      const allEvents = await service.fetchGroupEvents(group)
      expect(allEvents.group).toEqual(group)
      expect(allEvents.events.length).toEqual(7)
    })
  })
})
