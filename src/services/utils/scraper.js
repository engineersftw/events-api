const scrape = require('website-scraper')
let allGroups = {}

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
      allGroups[groupKey] = {
        groupUrl: formattedUrl
      }
    })
  }
}

const baseMeetupGroupOptions = {
  urls: [
    'https://www.meetup.com/cities/sg/singapore/tech/?country=sg&zipstatecity=singapore&category_names=tech&sort=founded_date'
  ],
  directory: './cache',
  plugins: [new CustomPlugin()],
  sources: [{ selector: '.groupCard.noRatings>div>a', attr: 'href' }]
}

const createGroupUrl = ({ pageNumber, pageSize }) =>
  `https://www.meetup.com/cities/sg/singapore/tech/?pageToken=founded_date%7c${pageNumber * pageSize}&country=sg&zipstatecity=singapore&category_names=tech&sort=founded_date`

const fetchMeetupGroups = async ({ pageNumber = 0, pageSize = 100 } = {}) => {
  await scrape({
    ...baseMeetupGroupOptions,
    urls: [
      createGroupUrl({ pageNumber, pageSize })
    ] })
  console.log(
    `Finished scrapping! ${Object.keys(allGroups).length} groups are found.`
  )
  return allGroups
}

const cleanScraperCache = () => {
  allGroups = {}
}

module.exports = { fetchMeetupGroups, createGroupUrl, cleanScraperCache }
