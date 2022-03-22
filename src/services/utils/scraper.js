const scrape = require('website-scraper')

const allGroups = {}

class CustomPlugin {
  apply (registerAction) {
    registerAction('saveResource', ({ resource }) => {
      /* this function is added so that the website resources are not actually saved in memory like /cache */
    })
    registerAction('onResourceSaved', ({ resource }) => {
      const { url, filename } = resource
      if (filename === 'index.html') {
        return
      }
      const groupKey = filename.replace('.html', '').split('-').join(' ')
      const formattedUrl = url.replace(/\/\?_cookie.*/, '')
      console.debug(`fetched ${groupKey}`)
      allGroups[groupKey] = {
        groupUrl: formattedUrl,
        eventsUrl: `${formattedUrl}events/rss`
      }
    })
  }
}

const meetupGroupOptions = {
  urls: [
    'https://www.meetup.com/cities/sg/singapore/tech/?country=sg&zipstatecity=singapore&category_names=tech'
  ],
  directory: './cache',
  plugins: [new CustomPlugin()],
  sources: [{ selector: '.groupCard.noRatings>div>a', attr: 'href' }]
}

const fetchMeetupGroups = async () => {
  await scrape(meetupGroupOptions)
  console.log(
    `Finished scrapping! ${Object.keys(allGroups).length} groups are found.`
  )
  return allGroups
}

module.exports = { fetchMeetupGroups }
