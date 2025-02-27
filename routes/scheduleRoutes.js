// routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();
const { Schedule, ScheduleEntry, Teacher, Subject, ClassGroup, Room, TimeSlot, sequelize } = require('../models');
const schedulerService = require('../services/schedulerService');
const { Op } = require('sequelize');

// Obtenir tous les emplois du temps
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un nouvel emploi du temps
router.post('/', async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

// Obtenir un emploi du temps par ID
router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    }
    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir les entrées d'un emploi du temps
router.get('/:id/entries', async (req, res) => {
  try {
    const entries = await ScheduleEntry.findAll({
      where: { ScheduleId: req.params.id },
      include: [Teacher, Subject, ClassGroup, Room, TimeSlot]
    });
    
    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Générer un emploi du temps
router.post('/generate', async (req, res) => {
  try {
    const result = await schedulerService.generateSchedule(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la génération de l\'emploi du temps', error: error.message });
  }
});

// Ajouter une entrée à un emploi du temps existant
router.post('/:id/entries', async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    }
    
    const entry = await ScheduleEntry.create({
      ...req.body,
      ScheduleId: schedule.id
    });
    
    const fullEntry = await ScheduleEntry.findByPk(entry.id, {
      include: [Teacher, Subject, ClassGroup, Room, TimeSlot]
    });
    
    res.status(201).json(fullEntry);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});

// Mettre à jour une entrée d'emploi du temps
router.put('/:scheduleId/entries/:entryId', async (req, res) => {
  try {
    const entry = await ScheduleEntry.findOne({
      where: {
        id: req.params.entryId,
        ScheduleId: req.params.scheduleId
      }
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Entrée d\'emploi du temps non trouvée' });
    }
    
    await entry.update(req.body);
    
    const updatedEntry = await ScheduleEntry.findByPk(entry.id, {
      include: [Teacher, Subject, ClassGroup, Room, TimeSlot]
    });
    
    res.json(updatedEntry);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Données invalides' });
  }
});


// Supprimer une entrée d'emploi du temps
router.delete('/:scheduleId/entries/:entryId', async (req, res) => {
  try {
    const entry = await ScheduleEntry.findOne({
      where: {
        id: req.params.entryId,
        ScheduleId: req.params.scheduleId
      }
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Entrée d\'emploi du temps non trouvée' });
    }
    
    await entry.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Publier un emploi du temps (changer son statut)
router.post('/:id/publish', async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    }
    
    // Utiliser une transaction pour s'assurer que tout est cohérent
    const t = await sequelize.transaction();
    
    try {
      await schedule.update({
        status: 'published',
        isActive: true
      }, { transaction: t });
      
      // Désactiver les autres emplois du temps actifs si celui-ci devient actif
      if (schedule.isActive) {
        await Schedule.update(
          { isActive: false },
          {
            where: {
              id: { [Op.ne]: schedule.id },
              isActive: true
            },
            transaction: t
          }
        );
      }
      
      await t.commit();
      res.json(schedule);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Archiver un emploi du temps
// Ajouter cette route pour supprimer un emploi du temps
router.delete('/:id', async (req, res) => {
  try {
    const scheduleId = req.params.id;
    
    // Vérifier si l'emploi du temps existe
    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    }
    
    // D'abord supprimer toutes les entrées associées à cet emploi du temps
    await ScheduleEntry.destroy({
      where: { ScheduleId: scheduleId }
    });
    
    // Puis supprimer l'emploi du temps lui-même
    await schedule.destroy();
    
    res.status(204).end(); // Réponse réussie sans contenu
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Obtenir l'emploi du temps par classe
router.get('/class/:classId', async (req, res) => {
  try {
    // Récupération de l'emploi du temps actif
    const activeSchedule = await Schedule.findOne({
      where: { isActive: true }
    });
    
    if (!activeSchedule) {
      return res.status(404).json({ message: 'Aucun emploi du temps actif' });
    }
    
    // Récupération des entrées pour cette classe
    const entries = await ScheduleEntry.findAll({
      where: {
        ScheduleId: activeSchedule.id,
        ClassGroupId: req.params.classId
      },
      include: [Teacher, Subject, Room, TimeSlot],
      order: [
        [TimeSlot, 'day', 'ASC'],
        [TimeSlot, 'startTime', 'ASC']
      ]
    });
    
    res.json({
      schedule: activeSchedule,
      entries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir l'emploi du temps par enseignant
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    // Récupération de l'emploi du temps actif
    const activeSchedule = await Schedule.findOne({
      where: { isActive: true }
    });
    
    if (!activeSchedule) {
      return res.status(404).json({ message: 'Aucun emploi du temps actif' });
    }
    
    // Récupération des entrées pour cet enseignant
    const entries = await ScheduleEntry.findAll({
      where: {
        ScheduleId: activeSchedule.id,
        TeacherId: req.params.teacherId
      },
      include: [ClassGroup, Subject, Room, TimeSlot],
      order: [
        [TimeSlot, 'day', 'ASC'],
        [TimeSlot, 'startTime', 'ASC']
      ]
    });
    
    res.json({
      schedule: activeSchedule,
      entries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir l'emploi du temps par salle
router.get('/room/:roomId', async (req, res) => {
  try {
    // Récupération de l'emploi du temps actif
    const activeSchedule = await Schedule.findOne({
      where: { isActive: true }
    });
    
    if (!activeSchedule) {
      return res.status(404).json({ message: 'Aucun emploi du temps actif' });
    }
    
    // Récupération des entrées pour cette salle
    const entries = await ScheduleEntry.findAll({
      where: {
        ScheduleId: activeSchedule.id,
        RoomId: req.params.roomId
      },
      include: [Teacher, ClassGroup, Subject, TimeSlot],
      order: [
        [TimeSlot, 'day', 'ASC'],
        [TimeSlot, 'startTime', 'ASC']
      ]
    });
    
    res.json({
      schedule: activeSchedule,
      entries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;