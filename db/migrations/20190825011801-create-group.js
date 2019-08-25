'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Groups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING
      },
      link: {
        type: Sequelize.STRING
      },
      urlname: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      members: {
        type: Sequelize.INTEGER
      },
      platform: {
        type: Sequelize.STRING,
        allowNull: false
      },
      platform_identifer: {
        type: Sequelize.STRING,
        allowNull: false
      },
      blacklisted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Groups');
  }
};