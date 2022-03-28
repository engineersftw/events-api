const harvesterService = require('./harvester_service')
const fetchedGroups = require('../../fixtures/fetchedGroups.json')
const fetchedEventsFromRSS = require('../../fixtures/fetchedEventsFromRSS.json')
const fetchedEventDetails = require('../../fixtures/fetchedEventDetails.json')
const db = require('../models/index')

describe('Harvester Service', () => {
  beforeAll(() => {
    let numEventsInRss = 0
    Object.values(fetchedEventsFromRSS).forEach(eventArray => { numEventsInRss += eventArray.length })
    expect(numEventsInRss).toBe(fetchedEventDetails.length)
  })
  beforeEach(() => {
    harvesterService.fetchGroups = jest.fn()
      .mockResolvedValueOnce(fetchedGroups)
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

  it('should save all fetched events and groups into DB if they do not already exist', async () => {
    await harvesterService.fetchAndSaveItemsInDB()
    const events = await db.Event.findAll({})
    expect(events).toHaveLength(fetchedEventDetails.length)

    const groups = await db.Group.findAll({})
    expect(groups).toHaveLength(Object.keys(fetchedGroups).length)
  })
})
