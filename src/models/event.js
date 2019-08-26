'use strict'
module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    location: DataTypes.TEXT,
    rsvp_count: DataTypes.INTEGER,
    url: DataTypes.STRING,
    group_id: DataTypes.STRING,
    group_name: DataTypes.STRING,
    group_url: DataTypes.STRING,
    formatted_time: DataTypes.STRING,
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    platform: DataTypes.STRING,
    platform_identifier: DataTypes.STRING,
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE
  }, {})
  Event.associate = function (models) {
    // associations can be defined here
  }
  return Event
}
