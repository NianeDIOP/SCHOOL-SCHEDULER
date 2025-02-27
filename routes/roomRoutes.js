// routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const { Room } = require('../models');

router.get('/', async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }
    await room.update(req.body);
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }
    await room.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;



