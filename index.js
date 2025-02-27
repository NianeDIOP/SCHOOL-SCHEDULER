const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { testConnection, syncDatabase } = require('./models/index');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de génération d\'emplois du temps scolaires' });
});

// Importer les routes
const teacherRoutes = require('./routes/teacherRoutes');

// Utiliser les routes
app.use('/api/teachers', teacherRoutes);
// Démarrer le serveur
app.listen(PORT, async () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  
  // Tester la connexion à la base de données
  await testConnection();
  
  // Synchroniser les modèles avec la base de données
  await syncDatabase();
});