const axios = require('axios')
const querystring = require('querystring')
const Sentry = require('@sentry/node')

class MeetupService {
  constructor (options = {}) {
    this.axios = {}
    this.authDomain = 'https://secure.meetup.com'
    this.apiDomain = 'https://api.meetup.com'
    this.consumerKey = options.consumerKey
    this.consumerSecret = options.consumerSecret
    this.redirectUri = options.redirectUri
    this.accessToken = null
    this.accessTokenExpiryTime = null
  }

  authorizeLink () {
    return `${this.authDomain}/oauth2/authorize?client_id=${this.consumerKey}&response_type=code&redirect_uri=${this.redirectUri}`
  }

  setAccessToken (newToken, expiresIn) {
    this.accessToken = newToken
    this.accessTokenExpiryTime = Date.now() + 1000 * expiresIn * 0.9
    this.axiosInstance('api').defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`
  }

  async fetchAccessToken (code) {
    try {
      const response = await this.axiosInstance('auth').post('/oauth2/access', querystring.stringify(
        {
          client_id: this.consumerKey,
          client_secret: this.consumerSecret,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
          code: code
        }
      ))

      console.log(`[API] POST /oauth2/access <authorization_code> (status ${response.status})`)

      if (response.status === 200) {
        return response.data
      } else {
        return { error: 'Invalid response' }
      }
    } catch (err) {
      console.error(`[API] POST /oauth2/access <authorization_code> error: ${err}`)
      Sentry.captureException(err)
      return { error: err.message }
    }
  }

  async refreshToken (refreshCode) {
    if (Date.now() < this.accessTokenExpiryTime) {
      console.log(`The current token is still valid`)
      return false
    }

    try {
      const response = await this.axiosInstance('auth').post('/oauth2/access', querystring.stringify(
        {
          client_id: this.consumerKey,
          client_secret: this.consumerSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshCode
        }
      ))

      console.log(`[API] POST /oauth2/access <refresh_token> (status ${response.status})`)

      if (response.status === 200) {
        return response.data
      } else {
        return { error: 'Invalid response' }
      }
    } catch (err) {
      console.error(`[API] POST /oauth2/access <refresh_token> error: ${err}`)
      Sentry.captureException(err)
      return { error: err.message }
    }
  }

  async fetchApi (uri, data = {}) {
    try {
      const response = await this.axiosInstance('api').get(uri, { params: data })

      console.log(`[API] GET ${uri} ${JSON.stringify(data)} (status ${response.status}, size ${response.headers['content-length']})`)

      if (response.status === 200) {
        return response
      } else {
        return { error: 'Invalid response' }
      }
    } catch (err) {
      console.error(`[API] GET ${uri} ${JSON.stringify(data)} error: ${err}`)
      Sentry.captureException(err)
      return { error: err.message }
    }
  }

  static isLegit (group) {
    // NOTE: This function may be given a group from the meetup API (in
    // harvest_groups.js), or a group from our DB (in checkExistingEvents), so
    // beware the differences.

    if (MeetupService.WHITELIST_GROUPS.includes(group.link)) { return true }

    if (MeetupService.BLACKLIST_GROUPS.includes(group.link)) { return false }

    const { name } = group
    const tokens = name.split(' ')

    if (tokens.length === 0) { return false }

    let validity = true

    tokens.forEach((token) => {
      if (MeetupService.BLACKLIST_TOKENS.includes(token.toLowerCase())) { validity = false }

      MeetupService.BLACKLIST_TOKENS.forEach((blToken) => {
        if (token.toLowerCase().includes(blToken)) { validity = false }
      })
    })

    return validity
  }

  axiosInstance (type) {
    if (this.axios[type]) { return this.axios[type] }

    this.axios[type] = axios.create({
      baseURL: (type === 'auth' ? this.authDomain : this.apiDomain),
      timeout: 30000
    })

    return this.axios[type]
  }

  static get BLACKLIST_TOKENS () {
    return ['ethereum', 'blockchain', 'bitcoin', 'ico', 'ledger', 'crypto', 'cryptocurrency', 'money', 'gold', 'token',
      'business', 'enterprise', 'entrepreneur', 'entrepreneurship', 'executive', 'founder', 'investor', 'skillsfuture']
  }

  static get WHITELIST_GROUPS () {
    // For groups which were caught by the filters, but might actually be interesting for developers
    return [
      // This group hosted Brendan's excellent DApps Dev Club in 2019, which taught developers the basics of Solidity
      // However it looks like some of their meetings have been less code-oriented, so I'm not whitelisting it right now
      // 'https://www.meetup.com/BlockChain-Dapps-Technology'
    ]
  }

  static get BLACKLIST_GROUPS () {
    // For groups which we don't want to show, but which weren't caught by the filters
    return [
      // Not tech related
      'https://www.meetup.com/Kakis-SG-Anything-Watever-Meetup-Group/',
      'https://www.meetup.com/Wireless-devices-and-your-health/',
      // I find this one a bit spammy, feels like a marketing drive
      'https://www.meetup.com/A-US-stock-market-listedCo-Big-Data-AI-New-Technology/'
    ]
  }
}

module.exports = MeetupService
