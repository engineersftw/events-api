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
