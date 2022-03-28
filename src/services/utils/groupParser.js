const axios = require('axios')
const { JSDOM } = require('jsdom')
const TurndownService = require('turndown')
const { isBlacklisted } = require('../../config/blacklist')

const turndownService = new TurndownService()

const getUrlName = (meetupGroupUrl) => {
  return meetupGroupUrl
    .replace('https://www.meetup.com/', '')
    .replace(/\//g, '')
}

const getGroupDetails = async (groupUrl) => {
  const response = await axios.get(groupUrl)
  if (response.status !== 200) {
    console.warn(`Fail to get retrieve group details for: ${groupUrl}`)
    return
  }

  const { data } = response
  try {
    const dom = new JSDOM(data, { runScripts: 'dangerously' }) // the option is required for the apollo script to run in the JSDOM
    const apolloState = dom.window.__APOLLO_STATE__.ROOT_QUERY
    const groupQuery = Object.keys(apolloState)[0]
    const id = groupQuery.match(/\d+/)[0]
    const urlname = getUrlName(groupUrl)
    const name = dom.window.document.querySelector('.groupHomeHeader-groupName').textContent

    let description = ''
    try {
      description = turndownService.turndown(
        dom.window.document.querySelector('#overview>.group-description--wrapper>div').innerHTML,
        { headingStyle: 'atx' }
      ).trim()
    } catch (err) {
      console.warn('Unable to fetch/convert group description from html to markdown', err)
    }

    return {
      name,
      platform: 'meetup',
      platform_identifier: id,
      link: groupUrl,
      urlname,
      description,
      active: true,
      blacklisted: isBlacklisted(name)
    }
  } catch (err) {
    console.error(`Error parsing group for ${groupUrl}: ${err}`)
  }
}

module.exports = { getGroupDetails }
