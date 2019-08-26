'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex(
      'Events',
      ['platform', 'platform_identifier'], 
      { indexName: 'group_events_search_index' }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropIndex('Events', 'group_events_search_index')
  }
};
