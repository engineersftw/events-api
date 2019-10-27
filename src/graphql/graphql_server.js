const { ApolloServer } = require('apollo-server-express')

const schemaPath = require('path').join(__dirname, '/schema.graphql')
const typeDefs = require('graphql-import').importSchema(schemaPath)

const { eventResolver, eventQueryResolver, eventsQueryResolver, createEventMutationResolver } = require('./resolvers/event')
const resolvers = {
  Query: {
    event: eventQueryResolver,
    events: eventsQueryResolver
  },
  Mutation: {
    createEvent: createEventMutationResolver
  },
  Event: eventResolver
}

module.exports = new ApolloServer({ typeDefs, resolvers, introspection: true, playground: true })
