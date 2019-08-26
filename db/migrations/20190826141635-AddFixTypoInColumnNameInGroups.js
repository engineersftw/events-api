'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('Groups', 'platform_identifer', 'platform_identifier')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('Groups', 'platform_identifier', 'platform_identifer')
  }
};
