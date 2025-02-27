const { sequelize } = require('../config/database');
const Teacher = require('./Teacher');

// Ici, vous pourrez ajouter d'autres modèles et définir les relations entre eux

// Synchronisation avec la base de données
const syncDatabase = async () => {
  try {
    // Sync all models with { force: true } drops existing tables and re-creates them
    // Use { alter: true } in development to update tables without dropping data
    // Use neither in production
    await sequelize.sync({ alter: true });
    console.log('Base de données synchronisée');
  } catch (error) {
    console.error('Erreur lors de la synchronisation de la base de données:', error);
  }
};

module.exports = {
  sequelize,
  Teacher,
  syncDatabase
};