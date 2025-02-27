// index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { testConnection, syncDatabase } = require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Servir les fichiers statiques depuis le dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route de base API
app.get('/api', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de génération d\'emplois du temps scolaires' });
});

// Importer les routes
const teacherRoutes = require('./routes/teacherRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const classGroupRoutes = require('./routes/classGroupRoutes');
const roomRoutes = require('./routes/roomRoutes');
const timeSlotRoutes = require('./routes/timeSlotRoutes');
const constraintRoutes = require('./routes/constraintRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

// Utiliser les routes API
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', classGroupRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/timeslots', timeSlotRoutes);
app.use('/api/constraints', constraintRoutes);
app.use('/api/schedules', scheduleRoutes);

// Route pour servir l'application frontend sur toutes les autres routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des erreurs 404 pour les routes API
app.use('/api/*', (req, res, next) => {
  res.status(404).json({ message: 'Route API non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrer le serveur
app.listen(PORT, async () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  
  // Tester la connexion à la base de données
  await testConnection();
  
  // Synchroniser les modèles avec la base de données
  await syncDatabase();
});