// models/ClassGroup.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClassGroup = sequelize.define('ClassGroup', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numberOfStudents: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = ClassGroup;