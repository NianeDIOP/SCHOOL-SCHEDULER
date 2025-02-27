// routes/classGroupRoutes.js
const express = require('express');
const router = express.Router();
const { ClassGroup } = require('../models');

router.get('/', async (req, res) => {
  try {
    const classGroups = await ClassGroup.findAll();
    res.json(classGroups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const classGroup = await ClassGroup.create(req.body);
    res.status(201).json(classGroup);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const classGroup = await ClassGroup.findByPk(req.params.id);
    if (!classGroup) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }
    res.json(classGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const classGroup = await ClassGroup.findByPk(req.params.id);
    if (!classGroup) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }
    await classGroup.update(req.body);
    res.json(classGroup);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const classGroup = await ClassGroup.findByPk(req.params.id);
    if (!classGroup) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }
    await classGroup.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;

