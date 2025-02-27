const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Définition du modèle Enseignant
const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  hoursPerWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 18
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Teacher;