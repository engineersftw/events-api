const db = require('../../models/index')

const buildConnection = require('./connection')
const uuidv1 = require('uuid/v1')
const { mutationResponse } = require('./mutationResponse')

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
  uid: parent => parent.id
}

async function createGroupMutationResolver (parent, args, context, info) {
  if (!context.user) {
    return mutationResponse(401, false, 'User not found')
  }

  const { group } = args

  try {
    group.platform = 'esg'
    group.platform_identifier = uuidv1()
    group.status = 'active'

    if (group.active === undefined) {
      group.active = true
    }

    const newGroup = await db.Group.create(group)

    return mutationResponse(200, true, 'Group created successfully', { group: newGroup })
  } catch (err) {
    mutationResponse(500, false, err.message)
  }

  return mutationResponse(500, false, 'Unknown error')
}

module.exports = { groupResolver, groupQueryResolver, groupsQueryResolver, createGroupMutationResolver }
