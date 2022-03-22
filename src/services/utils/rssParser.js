const Parser = require('rss-parser')
const parser = new Parser()

const parseRSS = async (url) => {
  try {
    console.debug(`Attempting parse RSS for: ${url}`)
    const feed = await parser.parseURL(url)

    if (!feed.items) {
      console.warn(`No items found for ${feed.title}, skipping this feed.`)
    }

    return feed.items || []
  } catch (error) {
    console.warn(`${error.message} for ${url}`)
    return []
  }
}

module.exports = { parseRSS }
