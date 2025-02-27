
// models/ScheduleEntry.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScheduleEntry = sequelize.define('ScheduleEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true // Si null, c'est hebdomadaire
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'regular' // regular, substitution, special, etc.
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = ScheduleEntry;