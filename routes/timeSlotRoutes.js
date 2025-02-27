// routes/timeSlotRoutes.js
// Importation du module express
const express = require('express');
// Création d'un routeur Express
const router = express.Router();
// Importation du modèle TimeSlot
const { TimeSlot } = require('../models');

/**
 * Route GET pour récupérer tous les créneaux horaires
 * @route GET /api/timeslots
 * @returns {Array} Liste de tous les créneaux horaires, triés par jour et heure
 */
router.get('/', async (req, res) => {
  try {
    const timeSlots = await TimeSlot.findAll({
      order: [
        ['day', 'ASC'],
        ['startTime', 'ASC']
      ]
    });
    res.json(timeSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Route POST pour créer un nouveau créneau horaire
 * @route POST /api/timeslots
 * @param {Object} req.body - Informations du créneau horaire
 * @returns {Object} Créneau horaire créé
 */
router.post('/', async (req, res) => {
  try {
    const timeSlot = await TimeSlot.create(req.body);
    res.status(201).json(timeSlot);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

/**
 * Route GET pour récupérer un créneau horaire spécifique par son ID
 * @route GET /api/timeslots/:id
 * @param {Number} req.params.id - ID du créneau horaire
 * @returns {Object} Créneau horaire trouvé
 */
router.get('/:id', async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findByPk(req.params.id);
    if (!timeSlot) {
      return res.status(404).json({ message: 'Créneau horaire non trouvé' });
    }
    res.json(timeSlot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Route PUT pour mettre à jour un créneau horaire spécifique
 * @route PUT /api/timeslots/:id
 * @param {Number} req.params.id - ID du créneau horaire
 * @param {Object} req.body - Nouvelles informations du créneau horaire
 * @returns {Object} Créneau horaire mis à jour
 */
router.put('/:id', async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findByPk(req.params.id);
    if (!timeSlot) {
      return res.status(404).json({ message: 'Créneau horaire non trouvé' });
    }
    await timeSlot.update(req.body);
    res.json(timeSlot);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

/**
 * Route DELETE pour supprimer un créneau horaire spécifique
 * @route DELETE /api/timeslots/:id
 * @param {Number} req.params.id - ID du créneau horaire
 * @returns {void} - Statut 204 sans contenu
 */
router.delete('/:id', async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findByPk(req.params.id);
    if (!timeSlot) {
      return res.status(404).json({ message: 'Créneau horaire non trouvé' });
    }
    await timeSlot.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Route GET pour récupérer tous les créneaux horaires d'un jour spécifique
 * @route GET /api/timeslots/day/:day
 * @param {String} req.params.day - Jour de la semaine (Lundi, Mardi, etc.)
 * @returns {Array} Liste des créneaux horaires du jour spécifié
 */
router.get('/day/:day', async (req, res) => {
  try {
    const timeSlots = await TimeSlot.findAll({
      where: { day: req.params.day },
      order: [['startTime', 'ASC']]
    });
    
    if (timeSlots.length === 0) {
      return res.status(404).json({ message: 'Aucun créneau horaire trouvé pour ce jour' });
    }
    
    res.json(timeSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Route GET pour récupérer tous les créneaux qui ne sont pas des pauses
 * @route GET /api/timeslots/classes
 * @returns {Array} Liste des créneaux horaires qui ne sont pas des pauses
 */
router.get('/type/classes', async (req, res) => {
  try {
    const timeSlots = await TimeSlot.findAll({
      where: { isBreak: false },
      order: [
        ['day', 'ASC'],
        ['startTime', 'ASC']
      ]
    });
    
    res.json(timeSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Exporter le routeur pour l'utiliser dans index.js
module.exports = router;