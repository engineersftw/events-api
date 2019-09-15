const { ApolloServer } = require('apollo-server-express')
const { typeDefs } = require('./graphql_schema')

const eventsResolver = require('../resolvers/events')

const db = require('../models/index')
const moment = require('moment-timezone')

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    event: async (parent, args, context, info) => {
      return db.Event.findByPk(parseInt(args.uid))
    },
    events: eventsResolver
  },
  Event: {
    uid: parent => parent.id,
    start_time: parent => moment(parent.start_time).tz('Asia/Singapore').format(),
    end_time: parent => moment(parent.end_time).tz('Asia/Singapore').format()
  }
}

const graphqlServer = new ApolloServer({ typeDefs, resolvers, introspection: true })

module.exports = graphqlServer
