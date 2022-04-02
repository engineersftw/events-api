const { fetchMeetupGroups, createGroupUrl } = require('./scraper')
const scrape = require('website-scraper')

jest.mock('website-scraper')

it('creates correct url for scraping groups based on pagination params', () => {
  const expectedUrl = `https://www.meetup.com/cities/sg/singapore/tech/?pageToken=founded_date%7c300&country=sg&zipstatecity=singapore&category_names=tech&sort=founded_date`
  expect(createGroupUrl({ pageNumber: 3, pageSize: 100 })).toBe(expectedUrl)
})

it('fetches meetup groups with pageNumber 0 and pageSize 100 by default if not given pagination params', async () => {
  await fetchMeetupGroups()
  expect(scrape).toBeCalledWith(expect.objectContaining({
    urls: [`https://www.meetup.com/cities/sg/singapore/tech/?pageToken=founded_date%7c${0}&country=sg&zipstatecity=singapore&category_names=tech&sort=founded_date`]
  }))
})

it('fetches meetup groups with pageSize 100 by default if given only page number', async () => {
  await fetchMeetupGroups({ pageNumber: 5 })
  expect(scrape).toBeCalledWith(expect.objectContaining({
    urls: [`https://www.meetup.com/cities/sg/singapore/tech/?pageToken=founded_date%7c${500}&country=sg&zipstatecity=singapore&category_names=tech&sort=founded_date`]
  }))
})
