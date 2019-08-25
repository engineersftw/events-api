jest.setTimeout(30000);

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
      let allGroups = []
      await service.prepareService()
      allGroups = await service.fetchGroups()
      expect(allGroups.length).toEqual(667)
    })
  })
})