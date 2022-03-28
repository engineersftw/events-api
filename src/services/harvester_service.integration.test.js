const harvesterService = require('./harvester_service')
const fetchedGroups = require('../../fixtures/fetchedGroups.json')
const fetchedEventsFromRSS = require('../../fixtures/fetchedEventsFromRSS.json')
const fetchedEventDetails = require('../../fixtures/fetchedEventDetails.json')
const db = require('../models/index')
const groupParser = require('./utils/groupParser')
const testGroups = [
  {
    name: 'Serverless Singapore',
    link: 'https://www.meetup.com/Serverless-Singapore/',
    platform: 'meetup',
    platform_identifier: '20291544',
    blacklisted: false,
    active: true
  },
  {
    name: 'Singapore LeetCode',
    link: 'https://www.meetup.com/Singapore-LeetCode/',
    platform: 'meetup',
    platform_identifier: '33264919',
    blacklisted: false,
    active: true
  }
]

describe('Harvester Service', () => {
  beforeAll(() => {
    let numEventsInRss = 0
    Object.values(fetchedEventsFromRSS).forEach(eventArray => { numEventsInRss += eventArray.length })
    expect(numEventsInRss).toBe(fetchedEventDetails.length)
  })

  beforeEach(() => {
    harvesterService.fetchGroups = jest.fn()
      .mockResolvedValue(fetchedGroups)
    harvesterService.fetchAllUpcomingEventsFromRss = jest.fn()
      .mockResolvedValue(fetchedEventsFromRSS)
    harvesterService.fetchAllEventDetails = jest.fn()
      .mockResolvedValue(fetchedEventDetails)
    jest.spyOn(groupParser, 'getGroupDetails').mockReturnValue(testGroups.map(group => Promise.resolve(group)))
  })

  afterEach(async () => {
    await db.Event.destroy({
      where: {},
      truncate: true
    })
    await db.Group.destroy({
      where: {},
      truncate: true
    })
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  afterAll(async () => {
    await db.sequelize.close()
  })

  it('should save all fetched events and groups into DB if they do not already exist', async () => {
    await harvesterService.fetchAndSaveItemsInDB()
    const events = await db.Event.findAll({})
    expect(events).toHaveLength(fetchedEventDetails.length)

    const groups = await db.Group.findAll({})
    expect(groups).toHaveLength(Object.keys(fetchedGroups).length)
  })

  it('should not fetch groups if they already exist', async () => {
    await db.Group.bulkCreate(testGroups)
    harvesterService.saveFetchedGroupsInDB = jest.fn().mockResolvedValueOnce(true)

    await harvesterService.fetchAndSaveItemsInDB()
    expect(harvesterService.fetchGroups).toBeCalledTimes(1)
    const groups = await db.Group.findAll({})
    expect(groups).toHaveLength(Object.keys(fetchedGroups).length)
  })

  it('should continously fetch new groups until service finds groups that are already in DB', async () => {
    await db.Group.bulkCreate(testGroups)
    harvesterService.saveFetchedGroupsInDB = jest.fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)

    await harvesterService.fetchAndSaveItemsInDB()
    expect(harvesterService.fetchGroups).toBeCalledTimes(3)
  })
})
