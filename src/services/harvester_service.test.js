require('dotenv').config()
jest.setTimeout(30000);

const HarvesterService = require('./harvester_service')
const nock = require('nock')
const nockBack = require('nock').back

const path = require('path')

nockBack.fixtures = path.join(__dirname, '../../fixtures')
nockBack.setMode('record')

let service

// Overwrite env var for testing
process.env.MEETUP_OAUTH_KEY = 'my_key'
process.env.MEETUP_OAUTH_SECRET = 'my_secret'
process.env.MEETUP_REFRESH_TOKEN = 'my_refresh_token'

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
  test.only('#fetchGroups', () => {
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