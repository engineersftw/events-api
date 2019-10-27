const db = require('../../models/index')

const buildConnection = require('./connection')

async function groupsQueryResolver (parent, args, context, info) {
  let { pageNumber, perPage } = args

  if (perPage === null) {
    perPage = 50
  }

  const whereQuery = {
    active: true
  }
  const orderQuery = [
    ['name', 'ASC']
  ]

  return buildConnection(db.Group, whereQuery, orderQuery, pageNumber, perPage)
}

async function groupQueryResolver (parent, args, context, info) {
  return db.Group.findByPk(parseInt(args.uid))
}

const groupResolver = {
  uid: parent => parent.id,
}

module.exports = { groupResolver, groupQueryResolver, groupsQueryResolver }
