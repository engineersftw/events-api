async function buildEventConnection (model, whereQuery, orderQuery, pageNumber = 1, perPage = 50) {
  const eventConnection = {
    nodes: [],
    pageInfo: {
      currentPage: pageNumber,
      hasNextPage: false,
      hasPreviousPage: false
    },
    totalCount: 0
  }

  eventConnection.totalCount = await model.count({ where: whereQuery })

  if (eventConnection.totalCount > 0) {
    const offsetCount = (pageNumber - 1) * perPage

    eventConnection.pageInfo.hasPreviousPage = (pageNumber > 1 && eventConnection.totalCount > perPage)
    eventConnection.pageInfo.hasNextPage = (pageNumber < Math.ceil(eventConnection.totalCount / perPage))

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

  return eventConnection
}

module.exports = buildEventConnection
