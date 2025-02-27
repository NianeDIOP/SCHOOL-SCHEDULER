const { Sequelize } = require('sequelize');

// Configuration de la connexion à la base de données
// Remplacez 'votre_mot_de_passe' par le mot de passe que vous avez défini lors de l'installation
const sequelize = new Sequelize('postgres://postgres:1990@localhost:5432/schoolscheduler', {
  dialect: 'postgres',
  logging: false // Mettez true pour voir les requêtes SQL dans la console
});

// Test de la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('Impossible de se connecter à la base de données:', error);
  }
};

// Exporter la connexion
module.exports = { sequelize, testConnection };