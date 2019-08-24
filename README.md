# NodeJS Backend Starter Kit

This is a starter kit with the following characteristics:

- Local Port Number: 3001
- Language: [NodeJS](https://nodejs.org/en/) (with NPM)
- App server: [Express JS](https://expressjs.com/)
- Authentication: PassportJS (http://www.passportjs.org/) - username + password with Cookies (no JWT)
- API framework: Roll our own REST API (no need for automated docs)
- Database: Postgres
- ORM: Sequelize (https://sequelize.org/)
- DB migration: https://sequelize.org/master/manual/migrations.html
- Testing:
    - Unit Tests: Jest (https://jestjs.io/)
- Linter: ESLint (https://eslint.org)

## Steps in preparing this starter kit

1. We use the [Express Generator](https://expressjs.com/en/starter/generator.html) to prepare the skeleton:

    ```bash
    npx express-generator --no-view --git
    ```

    Move the generated files into an `src` folder.

2. Add CORS middleware

	```bash
	npm install --save cors
	```

	Add these lines to 'app.js'

	```javascript
	const cors = require('cors')

	app.use(cors())
	```

3. Prepare the JavaScript linter

	We installed [ESLint](https://eslint.org) with the [StandardJS](https://github.com/standard/eslint-config-standard) coding style.

	1. `npx eslint --init`

	2. Select "Use a popular style guide."

	3. Select "Standard."

	4. Select 'JSON' as the config file format.

	5. If prompted, confirm the installation of the necessary dependencies.

	Update `package.json` with the `jslint` and `jsfmt` scripts

	```json
	"scripts": {
	  "jsfmt": "eslint \"src/**/*.js\" --fix",
	  "jslint": "eslint \"src/**/*.js\""
	}
	```

4. Add the [Jest](https://jestjs.io) testing framework:

    ```bash
    npm install --save-dev jest eslint-plugin-jest
    ```

    Add the ESLint configurations into `.eslintrc.js` (refer to <https://github.com/jest-community/eslint-plugin-jest#readme>)

5. Add nodemon for dev server

	```bash
	npm install --save-dev nodemon
	```

	Update `package.json` accordingly to add a dev server.

	```json
	"scripts": {
	  "start": "NODE_ENV=production node ./bin/www",
	  "dev": "NODE_ENV=development PORT=3001 DEBUG=app:* nodemon --ignore '*.test.js' --watch src bin/www"
	}
	```

6. Debugging

	Use [Debug](https://github.com/visionmedia/debug) to add your debugging messages to the terminal.

	```javascript
	const debug = require('debug')('app:users')

	debug('Hello World!')
	```

7. Add [DotEnv](https://github.com/motdotla/dotenv) for injecting environment variables through a `.env` file.

	```
	npm install --save dotenv
	```

	Copy the `env.sample` file to `.env` and update the variables in `.env`:

	```
	cp env.sample .env
	```

	You will then be able to view the env variables via `process.env.VAR_NAME`. As a convention, environment variables are all caps and underscore case.

8. Add other dependencies:

    ```bash
    npm install --save passport passport-local sequelize pg pg-hstore
    ```

## Managing Postgres Database

We are using [Postgres](https://www.postgresql.org/) as the database for this app.

### GUI tools

#### For MacOS

- [Postgres.App](https://postgresapp.com/) - The easiest way to get started with PostgreSQL on the Mac
- [Postico](https://eggerapps.at/postico/) - A Modern PostgreSQL Client for the Mac

#### For Windows

- [Postgres](https://www.postgresql.org/download/windows/) - Official installer for Postgres on Windows
- [pgAdmin](https://www.pgadmin.org/) - pgAdmin is the most popular and feature rich Open Source administration and development platform for PostgreSQL

### ORM

We are using [Sequelize](https://sequelize.org/) as our database ORM (Object Relational Mapping) library. You can use the CLI tool to run database migrations and to generate the models.

#### Create Databases

```
NODE_ENV=development ./node_modules/.bin/sequelize db:create
NODE_ENV=test ./node_modules/.bin/sequelize db:create
```

#### Migration

```
NODE_ENV=development ./node_modules/.bin/sequelize db:migrate
NODE_ENV=test ./node_modules/.bin/sequelize db:migrate
```

#### How we created the User model

```
./node_modules/.bin/sequelize model:generate --name User --attributes firstName:string,lastName:string,email:string,passwordHash:string
```

#### Seeding Database

```
./node_modules/.bin/sequelize db:seed:all
```

#### More info

Checkout the Sequelize v5 documentation for more info: <https://sequelize.org/master/>
