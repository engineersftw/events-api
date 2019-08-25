const axios = require('axios')
const querystring = require('querystring')

class MeetupService {
  constructor (options = {}) {
    this.axios = {}
    this.authDomain = 'https://secure.meetup.com'
    this.apiDomain = 'https://api.meetup.com'
    this.consumerKey = options.consumerKey
    this.consumerSecret = options.consumerSecret
    this.redirectUri = options.redirectUri
    this.accessToken = null
  }

  authorizeLink () {
    return `${this.authDomain}/oauth2/authorize?client_id=${this.consumerKey}&response_type=code&redirect_uri=${this.redirectUri}`
  }

  setAccessToken (newToken) {
    this.accessToken = newToken
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

      if (response.status === 200) {
        return response.data
      } else {
        return { error: 'Invalid response' }
      }
    } catch (err) {
      return { error: err.message }
    }
  }

  async refreshToken (refreshCode) {
    try {
      const response = await this.axiosInstance('auth').post('/oauth2/access', querystring.stringify(
        {
          client_id: this.consumerKey,
          client_secret: this.consumerSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshCode
        }
      ))

      if (response.status === 200) {
        return response.data
      } else {
        return { error: 'Invalid response' }
      }
    } catch (err) {
      return { error: err.message }
    }
  }

  async fetchApi (uri, data = {}) {
    try {
      const response = await this.axiosInstance('api').get(uri, { params: data })

      if (response.status === 200) {
        return response
      } else {
        return { error: 'Invalid response' }
      }
    } catch (err) {
      return { error: err.message }
    }
  }

  static isLegit (_) {
    return true
  }

  axiosInstance (type) {
    if (this.axios[type]) { return this.axios[type] }

    this.axios[type] = axios.create({
      baseURL: (type === 'auth' ? this.authDomain : this.apiDomain),
      timeout: 30000
    })

    return this.axios[type]
  }
}

module.exports = MeetupService
