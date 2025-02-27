// models/TeacherAvailability.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherAvailability = sequelize.define('TeacherAvailability', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  day: {
    type: DataTypes.ENUM('Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'),
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  preference: {
    type: DataTypes.ENUM('high', 'medium', 'low', 'unavailable'),
    allowNull: false,
    defaultValue: 'medium'
  }
});

module.exports = TeacherAvailability;