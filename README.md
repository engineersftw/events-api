# Engineers.SG Events API

## Contributing Guide

### Initial setup steps for local development

1. Copy `env.sample` to `.env`
2. Update the contents appropriately.
3. Start the Postgres and Redis datastore on Docker

    ```
    docker-compose -f docker-compose-dev.yml up -d
    ```

4. Prepare the databases

    ```
    NODE_ENV=development npm run db:create
    NODE_ENV=development npm run db:migrate
    NODE_ENV=test npm run db:create
    NODE_ENV=test npm run db:migrate
    ```
### Set up your meetup credentials

To pull data from Meetup, you first need to register as a Meetup API consumer:

1. Visit https://secure.meetup.com/meetup_api/oauth_consumers/ and (if you don't already have a consumer) hit [Create New Consumer]

   Be sure to set the redirect_url to `http://localhost:3001/oauth`

2. Wait for an approval email from meetup.com (may take a day or two)

3. Revisit https://secure.meetup.com/meetup_api/oauth_consumers/ and copy the Key and Secret into `.env` as `MEETUP_OAUTH_KEY` and `MEETUP_OAUTH_SECRET`

4. Start the app with: `npm run dev`

5. Visit http://localhost:3001/oauth

6. After allowing authorization, copy the displayed `refresh_token` string into `.env` as `MEETUP_REFRESH_TOKEN`

### Test the collection service

Now you should be able to run the full process:

```
npm run harvest:groups | tee harvest_groups.out

npm run harvest:events | tee harvest_events.out

npm run harvest:events:worker | tee harvest_events_worker.out
```
