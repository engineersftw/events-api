async function buildConnection (model, whereQuery, orderQuery, pageNumber = 1, perPage = 50) {
  const eventConnection = {
    nodes: [],
    pageInfo: {
      currentPage: pageNumber,
      hasNextPage: false,
      hasPreviousPage: false
    },
    totalCount: 0
  }

  try {
    eventConnection.totalCount = await model.count({ where: whereQuery })

    if (eventConnection.totalCount > 0) {
      eventConnection.pageInfo.hasNextPage = (pageNumber < Math.ceil(eventConnection.totalCount / perPage))
      eventConnection.pageInfo.hasPreviousPage = (pageNumber > 1 && eventConnection.totalCount > perPage)

      if (pageNumber < 1) {
        return eventConnection
      }

      const offsetCount = (pageNumber - 1) * perPage

      if (offsetCount < eventConnection.totalCount) {
        eventConnection.nodes = await model
          .findAll({
            where: whereQuery,
            order: orderQuery,
            offset: offsetCount,
            limit: perPage
          })
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(err.message)
    } else {
      throw err
    }
  }

  return eventConnection
}

module.exports = buildConnection
