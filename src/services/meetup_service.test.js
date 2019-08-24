const MeetupService = require('./meetup_service')
const nock = require('nock')

let service
const consumerKey = 'my_key'
const consumerSecret = 'my_secret'
const redirectUri = 'http://localhost/oauth/auth'

beforeEach(() => {
  nock.disableNetConnect()
  service = new MeetupService({
    consumerKey: consumerKey,
    consumerSecret: consumerSecret,
    redirectUri: redirectUri
  })
})

afterEach(() => {
  nock.enableNetConnect()
})

describe('MeetupService', () => {
  test('authorizeLink', () => {
    const result = `https://secure.meetup.com/oauth2/authorize?client_id=${consumerKey}&response_type=code&redirect_uri=${redirectUri}`
    expect(service.authorizeLink()).toEqual(result)
  })

  test('Request access token', async () => {
    nock('https://secure.meetup.com')
      .post('/oauth2/access')
      .reply(200, {
        access_token: 'ACCESS_TOKEN_TO_STORE',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'TOKEN_USED_TO_REFRESH_AUTHORIZATION'
      })

    const result = await service.fetchAccessToken()

    expect(result).toEqual({
      access_token: 'ACCESS_TOKEN_TO_STORE',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'TOKEN_USED_TO_REFRESH_AUTHORIZATION'
    })
  })

  test('Refresh token', async () => {
    nock('https://secure.meetup.com')
      .post('/oauth2/access', 'client_id=my_key&client_secret=my_secret&grant_type=refresh_token&refresh_token=my_refresh_code')
      .reply(200, {
        access_token: 'ACCESS_TOKEN_TO_STORE',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'TOKEN_USED_TO_REFRESH_AUTHORIZATION'
      })

    const refreshCode = 'my_refresh_code'
    const result = await service.refreshToken(refreshCode)

    expect(result).toEqual({
      access_token: 'ACCESS_TOKEN_TO_STORE',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'TOKEN_USED_TO_REFRESH_AUTHORIZATION'
    })
  })

  test('make API calls', async () => {
    const newToken = 'new_token'

    nock('https://api.meetup.com', {
      reqheaders: {
        authorization: `Bearer ${newToken}`
      }
    })
      .get('/members/self')
      .reply(200, {
        id: 23459461,
        name: 'Michael Cheng',
        email: 'michael@example.com',
        status: 'active',
        joined: 1314099498000,
        city: 'Singapore',
        country: 'sg',
        localized_country_name: 'Singapore',
        lat: 1.3,
        lon: 103.85,
        photo: {
          id: 253050364,
          highres_link: 'https://secure.meetupstatic.com/photos/member/7/6/9/c/highres_253050364.jpeg',
          photo_link: 'https://secure.meetupstatic.com/photos/member/7/6/9/c/member_253050364.jpeg',
          thumb_link: 'https://secure.meetupstatic.com/photos/member/7/6/9/c/thumb_253050364.jpeg',
          type: 'member',
          base_url: 'https://secure.meetupstatic.com'
        },
        is_pro_admin: false
      })

    service.setAccessToken(newToken)
    const result = await service.fetchApi('/members/self')

    expect(result.data.name).toEqual('Michael Cheng')
    expect(result.data.status).toEqual('active')
  })
})
