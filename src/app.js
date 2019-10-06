require('dotenv').config()

const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')

const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')
const eventsRouter = require('./routes/events')
const groupsRouter = require('./routes/groups')
const arenaRouter = require('./routes/arena')
const graphqlServer = require('./graphql/graphql_server')

const app = express()

const Sentry = require('@sentry/node')
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN })
  app.use(Sentry.Handlers.requestHandler())
}

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/events', eventsRouter)
app.use('/groups', groupsRouter)
app.use('/arena', arenaRouter)

graphqlServer.applyMiddleware({ app })

if (process.env.NODE_ENV === 'development') { app.use('/oauth', authRouter) }

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler())
}

module.exports = app
