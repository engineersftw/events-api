jest.setTimeout(30000)

const MeetupHarvester = require('./meetup_harvester')
const nockVCR = require('../../../test/nock_vcr')

let service

beforeEach(() => {
  service = new MeetupHarvester({
    consumerKey: process.env.MEETUP_OAUTH_KEY,
    consumerSecret: process.env.MEETUP_OAUTH_SECRET,
    refreshToken: process.env.MEETUP_REFRESH_TOKEN
  })
})

describe('MeetupHarvester', () => {
  test('#fetchGroups', () => {
    return nockVCR('allGroups.json', async () => {
      await service.prepareService()
      const allGroups = await service.fetchGroups()
      expect(allGroups.length).toEqual(667)
    })
  })

  test('#fetchGroupEvents', () => {
    return nockVCR('groupEvents.json', async () => {
      const group = { urlname: 'SGInnovate' }
      await service.prepareService()
      const allEvents = await service.fetchGroupEvents(group)
      expect(allEvents.length).toEqual(7)
    })
  })
})
