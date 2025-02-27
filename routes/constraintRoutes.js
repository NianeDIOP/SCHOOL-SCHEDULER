// routes/constraintRoutes.js
const express = require('express');
const router = express.Router();
const { Constraint } = require('../models');

router.get('/', async (req, res) => {
  try {
    const constraints = await Constraint.findAll();
    res.json(constraints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const constraint = await Constraint.create(req.body);
    res.status(201).json(constraint);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const constraint = await Constraint.findByPk(req.params.id);
    if (!constraint) {
      return res.status(404).json({ message: 'Contrainte non trouvée' });
    }
    res.json(constraint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const constraint = await Constraint.findByPk(req.params.id);
    if (!constraint) {
      return res.status(404).json({ message: 'Contrainte non trouvée' });
    }
    await constraint.update(req.body);
    res.json(constraint);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const constraint = await Constraint.findByPk(req.params.id);
    if (!constraint) {
      return res.status(404).json({ message: 'Contrainte non trouvée' });
    }
    await constraint.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;