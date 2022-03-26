const harvesterService = require('./harvester_service')
const fetchedGroupsWithRSS = require('../../fixtures/fetchedGroupsWithRSS.json')
const fetchedEventsFromRSS = require('../../fixtures/fetchedEventsFromRSS.json')
const fetchedEventDetails = require('../../fixtures/fetchedEventDetails.json')
const db = require('../models/index')

describe('Harvester Service', () => {
  beforeEach(() => {
    harvesterService.fetchGroupsWithRss = jest.fn()
      .mockResolvedValueOnce(fetchedGroupsWithRSS)
    harvesterService.fetchAllUpcomingEventsFromRss = jest.fn()
      .mockResolvedValueOnce(fetchedEventsFromRSS)
    harvesterService.fetchAllEventDetails = jest.fn()
      .mockResolvedValueOnce(fetchedEventDetails)
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
  })

  afterAll(async () => {
    await db.sequelize.close()
  })

  it('should save all fetched events into DB if they do not already exist', async () => {
    await harvesterService.fetchAndSaveItemsIntoDB()
    const events = await db.Event.findAll({ })
    expect(events).toHaveLength(fetchedEventDetails.length - 1) // there is one event inside that is a duplicate of another
  })
})
