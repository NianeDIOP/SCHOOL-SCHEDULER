// models/Constraint.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Constraint = sequelize.define('Constraint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM(
      'teacher_unavailable', 
      'room_unavailable', 
      'class_limit', 
      'consecutive_classes',
      'same_day_classes',
      'max_hours_per_day',
      'specific_room_required',
      'custom'
    ),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('hard', 'soft'),
    allowNull: false,
    defaultValue: 'hard' // hard constraints must be satisfied, soft are preferences
  },
  weight: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1 // For soft constraints, used to prioritize
  },
  parameters: {
    type: DataTypes.JSON,
    allowNull: true // Specific parameters for each constraint type
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Constraint;