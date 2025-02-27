// models/TeacherSubject.js (relation entre enseignants et matières)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherSubject = sequelize.define('TeacherSubject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hoursPerWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

module.exports = TeacherSubject;