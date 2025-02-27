// models/Subject.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#CCCCCC' // Couleur par défaut pour l'affichage
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Subject;