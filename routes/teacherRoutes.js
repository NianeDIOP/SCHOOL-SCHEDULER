// routes/teacherRoutes.js
// Importation du module express
const express = require('express');
// Création d'un routeur Express
const router = express.Router();
// Importation des modèles nécessaires
const { Teacher, Subject, TeacherSubject, TeacherAvailability } = require('../models');

/**
 * Route GET pour récupérer tous les enseignants
 * @route GET /api/teachers
 * @returns {Array} Liste de tous les enseignants
 */
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    res.json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Route POST pour créer un nouvel enseignant
 * @route POST /api/teachers
 * @param {Object} req.body - Informations de l'enseignant
 * @returns {Object} Enseignant créé
 */
router.post('/', async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    res.status(201).json(teacher);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

/**
 * Route GET pour récupérer un enseignant spécifique par son ID
 * @route GET /api/teachers/:id
 * @param {Number} req.params.id - ID de l'enseignant
 * @returns {Object} Enseignant trouvé avec ses matières et disponibilités
 */
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [
        { 
          model: Subject,
          through: { attributes: ['hoursPerWeek', 'isPrimary'] }
        },
        TeacherAvailability
      ]
    });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }
    
    res.json(teacher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Route PUT pour mettre à jour un enseignant spécifique
 * @route PUT /api/teachers/:id
 * @param {Number} req.params.id - ID de l'enseignant
 * @param {Object} req.body - Nouvelles informations de l'enseignant
 * @returns {Object} Enseignant mis à jour
 */
router.put('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }
    await teacher.update(req.body);
    res.json(teacher);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

/**
 * Route DELETE pour supprimer un enseignant spécifique
 * @route DELETE /api/teachers/:id
 * @param {Number} req.params.id - ID de l'enseignant
 * @returns {void} - Statut 204 sans contenu
 */
router.delete('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }
    await teacher.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Route POST pour assigner une matière à un enseignant
 * @route POST /api/teachers/:teacherId/subjects/:subjectId
 * @param {Number} req.params.teacherId - ID de l'enseignant
 * @param {Number} req.params.subjectId - ID de la matière
 * @param {Object} req.body - Détails de l'assignation (heures par semaine, matière principale)
 * @returns {Object} Relation créée ou mise à jour
 */
router.post('/:teacherId/subjects/:subjectId', async (req, res) => {
  try {
    const { teacherId, subjectId } = req.params;
    const { hoursPerWeek, isPrimary } = req.body;
    
    const [teacherSubject, created] = await TeacherSubject.findOrCreate({
      where: { TeacherId: teacherId, SubjectId: subjectId },
      defaults: { hoursPerWeek, isPrimary }
    });
    
    if (!created) {
      await teacherSubject.update({ hoursPerWeek, isPrimary });
    }
    
    res.status(201).json(teacherSubject);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

/**
 * Route POST pour ajouter une disponibilité à un enseignant
 * @route POST /api/teachers/:teacherId/availability
 * @param {Number} req.params.teacherId - ID de l'enseignant
 * @param {Object} req.body - Détails de la disponibilité
 * @returns {Object} Disponibilité créée
 */
router.post('/:teacherId/availability', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const availability = await TeacherAvailability.create({
      ...req.body,
      TeacherId: teacherId
    });
    
    res.status(201).json(availability);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

// Exporter le routeur pour l'utiliser dans index.js
module.exports = router;