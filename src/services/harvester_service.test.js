require('dotenv').config()
jest.setTimeout(30000);

const HarvesterService = require('./harvester_service')
const nock = require('nock')
const nockBack = require('nock').back

const path = require('path')

nockBack.fixtures = path.join(__dirname, '../../fixtures')
nockBack.setMode('record')

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
    return nockBack('allGroups.json').then(({ nockDone }) => {
      return (async () => {
        let allGroups = []
        await service.prepareService()
        allGroups = await service.fetchGroups()
        expect(allGroups.length).toEqual(667)
      })().then(nockDone)
    })
  })
})