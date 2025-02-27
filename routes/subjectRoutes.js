// routes/subjectRoutes.js
// Importation du module express
const express = require('express');
// Création d'un routeur Express
const router = express.Router();
// Importation du modèle Subject depuis le dossier models
const { Subject } = require('../models');

/**
 * Route GET pour récupérer toutes les matières
 * @route GET /api/subjects
 * @returns {Array} Liste de toutes les matières
 */
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.findAll();
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Route POST pour créer une nouvelle matière
 * @route POST /api/subjects
 * @param {Object} req.body - Informations de la matière
 * @returns {Object} Matière créée
 */
router.post('/', async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

/**
 * Route GET pour récupérer une matière spécifique par son ID
 * @route GET /api/subjects/:id
 * @param {Number} req.params.id - ID de la matière
 * @returns {Object} Matière trouvée
 */
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }
    res.json(subject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Route PUT pour mettre à jour une matière spécifique
 * @route PUT /api/subjects/:id
 * @param {Number} req.params.id - ID de la matière
 * @param {Object} req.body - Nouvelles informations de la matière
 * @returns {Object} Matière mise à jour
 */
router.put('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }
    await subject.update(req.body);
    res.json(subject);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

/**
 * Route DELETE pour supprimer une matière spécifique
 * @route DELETE /api/subjects/:id
 * @param {Number} req.params.id - ID de la matière
 * @returns {void} - Statut 204 sans contenu
 */
router.delete('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }
    await subject.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Exporter le routeur pour l'utiliser dans index.js
module.exports = router;