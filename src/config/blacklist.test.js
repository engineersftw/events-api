const { blacklistedGroups, blacklistedGroupUrls } = require('./blacklist')

it('expect blacklistedGroups to contain groups names from blacklisted group urls', () => {
  const urls = blacklistedGroupUrls.map(url =>
    url
      .replace('https://www.meetup.com/', '')
      .replace(/-/g, ' '))

  urls.forEach(url => {
    expect(blacklistedGroups).toContain(url)
  })
})
