'use strict'
module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    name: { type: DataTypes.STRING, allowNull: false },
    status: DataTypes.STRING,
    link: DataTypes.STRING,
    urlname: DataTypes.STRING,
    description: DataTypes.TEXT,
    members: DataTypes.INTEGER,
    platform: { type: DataTypes.STRING, allowNull: false },
    platform_identifer: { type: DataTypes.STRING, allowNull: false },
    blacklisted: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
    active: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false }
  }, {})
  Group.associate = function (models) {
    // associations can be defined here
  }
  return Group
}
