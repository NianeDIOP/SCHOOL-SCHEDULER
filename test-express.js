// test-express.js
// Ce fichier permet de tester si Express est correctement installé et fonctionnel

// Importation d'Express
const express = require('express');
console.log('Express importé avec succès:', typeof express === 'function');

// Création d'une application Express
const app = express();
console.log('Application Express créée avec succès:', typeof app === 'function');

// Création d'un routeur Express
const router = express.Router();
console.log('Router créé avec succès:', typeof router === 'function');

// Test de quelques méthodes du routeur pour confirmer qu'il s'agit bien d'un routeur Express
console.log('Méthodes du routeur:', {
  get: typeof router.get === 'function',
  post: typeof router.post === 'function',
  put: typeof router.put === 'function',
  delete: typeof router.delete === 'function'
});

// Affichage de la version d'Express
console.log('Version d\'Express:', express.version);

console.log('Test terminé! Si tous les résultats sont "true", Express est correctement configuré.');