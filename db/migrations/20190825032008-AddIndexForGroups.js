'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex(
        'Groups',
        ['platform', 'platform_identifer'], 
        { indexName: 'group_search_index' }
      )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropIndex('Groups', 'group_search_index')
  }
};
