// services/schedulerService.js

const { 
    Teacher, 
    Subject, 
    ClassGroup, 
    Room, 
    TimeSlot, 
    TeacherSubject,
    TeacherAvailability,
    Schedule,
    ScheduleEntry,
    Constraint,
    sequelize 
  } = require('../models');
  
  /**
   * Service pour la génération d'emplois du temps
   */
  class SchedulerService {
    
    /**
     * Génère un emploi du temps complet
     * @param {Object} params Paramètres de génération
     * @returns {Object} Résultat de la génération
     */
    async generateSchedule(params = {}) {
      try {
        // Création d'un nouvel emploi du temps
        const schedule = await this._createSchedule(params);
        
        // Récupération des données nécessaires
        const teachers = await this._getTeachersWithSubjects();
        const classGroups = await ClassGroup.findAll();
        const rooms = await Room.findAll({ where: { isAvailable: true } });
        const timeSlots = await TimeSlot.findAll({ 
          where: { isBreak: false },
          order: [['day', 'ASC'], ['startTime', 'ASC']]
        });
        const constraints = await Constraint.findAll({ where: { isActive: true } });
        
        // Calcul des cours à programmer
        const classRequirements = await this._calculateClassRequirements(classGroups);
        
        // Initialisation de la solution
        const solution = [];
        let unassignedClasses = [];
        
        // Utilisation d'une transaction pour s'assurer que tout est enregistré ou rien
        const t = await sequelize.transaction();
        
        try {
          // Algorithme de planification basé sur les contraintes
          const result = await this._schedulingAlgorithm(
            schedule,
            teachers,
            classGroups,
            rooms,
            timeSlots,
            classRequirements,
            constraints
          );
          
          // Enregistrement des entrées d'emploi du temps
          for (const entry of result.solution) {
            await ScheduleEntry.create({
              ScheduleId: schedule.id,
              ClassGroupId: entry.classGroupId,
              SubjectId: entry.subjectId,
              TeacherId: entry.teacherId,
              RoomId: entry.roomId,
              TimeSlotId: entry.timeSlotId,
              type: 'regular',
              notes: entry.notes
            }, { transaction: t });
          }
          
          // Mise à jour du statut de l'emploi du temps
          await schedule.update({
            generatedAt: new Date(),
            status: result.unassignedClasses.length === 0 ? 'published' : 'draft'
          }, { transaction: t });
          
          // Validation de la transaction
          await t.commit();
          
          return {
            scheduleId: schedule.id,
            solution: result.solution,
            unassignedClasses: result.unassignedClasses,
            success: result.unassignedClasses.length === 0
          };
          
        } catch (error) {
          // En cas d'erreur, annulation de toutes les modifications
          await t.rollback();
          throw error;
        }
      } catch (error) {
        console.error('Erreur lors de la génération de l\'emploi du temps:', error);
        throw error;
      }
    }
    
    /**
     * Crée un nouvel emploi du temps
     * @param {Object} params Paramètres de l'emploi du temps
     * @returns {Object} Emploi du temps créé
     * @private
     */
    async _createSchedule(params) {
      const { name, startDate, endDate } = params;
      
      return await Schedule.create({
        name: name || `Emploi du temps ${new Date().toLocaleDateString('fr-FR')}`,
        startDate: startDate || new Date(),
        endDate: endDate || this._calculateEndDate(startDate),
        isActive: false,
        status: 'draft',
        generatedAt: null
      });
    }
    
    /**
     * Calcule la date de fin par défaut (1 semestre après la date de début)
     * @param {Date} startDate Date de début
     * @returns {Date} Date de fin calculée
     * @private
     */
    _calculateEndDate(startDate) {
      const date = startDate ? new Date(startDate) : new Date();
      date.setMonth(date.getMonth() + 4); // Par défaut, durée d'un semestre
      return date;
    }
    
    /**
     * Récupère les enseignants avec leurs matières
     * @returns {Array} Liste des enseignants avec leurs matières
     * @private
     */
    async _getTeachersWithSubjects() {
      return await Teacher.findAll({
        include: [{
          model: Subject,
          through: { attributes: ['hoursPerWeek', 'isPrimary'] }
        }, {
          model: TeacherAvailability
        }]
      });
    }
    
    /**
     * Calcule les besoins en cours pour chaque classe
     * @param {Array} classGroups Liste des classes
     * @returns {Array} Liste des cours à programmer
     * @private
     */
    async _calculateClassRequirements(classGroups) {
      // Dans un système réel, ces exigences seraient stockées dans la base de données
      // Ici, pour simplifier, nous créons des exigences fictives
      
      const requirements = [];
      const subjects = await Subject.findAll();
      
      for (const classGroup of classGroups) {
        // Distribution des heures en fonction du niveau
        let hoursDistribution;
        
        switch (classGroup.level) {
          case 'CP':
          case 'CE1':
          case 'CE2':
          case 'CM1':
          case 'CM2':
            // Primaire - concentration sur les matières fondamentales
            hoursDistribution = {
              'Français': 9,
              'Mathématiques': 5,
              'Histoire-Géographie': 3,
              'Sciences': 2,
              'Arts': 2,
              'Sport': 3
            };
            break;
          case '6ème':
          case '5ème':
          case '4ème':
          case '3ème':
            // Collège - plus de diversité
            hoursDistribution = {
              'Français': 4,
              'Mathématiques': 4,
              'Histoire-Géographie': 3,
              'Sciences Physiques': 2,
              'SVT': 2,
              'Anglais': 3,
              'Espagnol': 2,
              'Technologie': 1,
              'Arts Plastiques': 1,
              'Musique': 1,
              'EPS': 3
            };
            break;
          case '2nde':
          case '1ère':
          case 'Terminale':
            // Lycée - spécialisation
            hoursDistribution = {
              'Français': 4,
              'Mathématiques': 4,
              'Histoire-Géographie': 3,
              'Physique-Chimie': 3,
              'SVT': 2,
              'Anglais': 3,
              'Philosophie': 2,
              'SES': 3,
              'EPS': 2
            };
            break;
          default:
            // Par défaut
            hoursDistribution = {
              'Français': 4,
              'Mathématiques': 4,
              'Histoire-Géographie': 2,
              'Sciences': 2,
              'Langue': 2,
              'Sport': 2
            };
        }
        
        // Création des exigences de cours pour cette classe
        for (const [subjectName, hours] of Object.entries(hoursDistribution)) {
          const subject = subjects.find(s => s.name === subjectName);
          
          if (subject) {
            requirements.push({
              classGroupId: classGroup.id,
              subjectId: subject.id,
              hoursPerWeek: hours,
              // Un cours dure généralement entre 1 et 2 heures
              sessionsPerWeek: Math.ceil(hours / 2),
              priority: subjectName === 'Français' || subjectName === 'Mathématiques' ? 'high' : 'medium'
            });
          }
        }
      }
      
      return requirements;
    }
    
    /**
     * Algorithme principal de planification basé sur les contraintes
     * @param {Object} schedule Emploi du temps à générer
     * @param {Array} teachers Liste des enseignants
     * @param {Array} classGroups Liste des classes
     * @param {Array} rooms Liste des salles
     * @param {Array} timeSlots Liste des créneaux horaires
     * @param {Array} classRequirements Exigences de cours pour chaque classe
     * @param {Array} constraints Liste des contraintes
     * @returns {Object} Solution trouvée et cours non assignés
     * @private
     */
    async _schedulingAlgorithm(
      schedule,
      teachers,
      classGroups,
      rooms,
      timeSlots,
      classRequirements,
      constraints
    ) {
      // Initialisation
      const solution = [];
      const unassignedClasses = [];
      
      // Trie des exigences par priorité pour traiter d'abord les cours importants
      classRequirements.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        return b.hoursPerWeek - a.hoursPerWeek;
      });
      
      // Préparation des données pour l'algorithme
      const assignments = this._initAssignments(timeSlots, classGroups);
      const teacherAssignments = this._initTeacherAssignments(timeSlots, teachers);
      const roomAssignments = this._initRoomAssignments(timeSlots, rooms);
      
      // Pour chaque exigence de cours
      for (const requirement of classRequirements) {
        const { classGroupId, subjectId, sessionsPerWeek } = requirement;
        const classGroup = classGroups.find(c => c.id === classGroupId);
        
        // Trouve un enseignant qualifié pour cette matière
        const eligibleTeachers = this._findEligibleTeachers(teachers, subjectId);
        
        if (eligibleTeachers.length === 0) {
          // Pas d'enseignant disponible pour cette matière
          unassignedClasses.push({
            ...requirement,
            reason: 'Pas d\'enseignant disponible pour cette matière'
          });
          continue;
        }
        
        // Nombre de sessions à programmer
        for (let session = 0; session < sessionsPerWeek; session++) {
          let assigned = false;
          
          // Pour chaque enseignant éligible
          for (const teacher of eligibleTeachers) {
            // Vérifie le nombre d'heures déjà assignées à cet enseignant
            const teacherHours = this._countTeacherHours(teacherAssignments, teacher.id);
            if (teacherHours >= teacher.hoursPerWeek) {
              continue; // Enseignant déjà au maximum de ses heures
            }
            
            // Cherche un créneau disponible
            const availableSlot = this._findAvailableSlot(
              timeSlots,
              assignments,
              teacherAssignments,
              roomAssignments,
              classGroupId,
              teacher.id,
              constraints
            );
            
            if (availableSlot) {
              // Cherche une salle disponible
              const availableRoom = this._findAvailableRoom(
                rooms,
                roomAssignments,
                availableSlot.timeSlotId,
                subjectId,
                constraints
              );
              
              if (availableRoom) {
                // Création de l'entrée d'emploi du temps
                const entry = {
                  classGroupId,
                  subjectId,
                  teacherId: teacher.id,
                  roomId: availableRoom.id,
                  timeSlotId: availableSlot.timeSlotId,
                  notes: null
                };
                
                // Mise à jour des assignations
                assignments[classGroupId][availableSlot.timeSlotId] = true;
                teacherAssignments[teacher.id][availableSlot.timeSlotId] = true;
                roomAssignments[availableRoom.id][availableSlot.timeSlotId] = true;
                
                // Ajout à la solution
                solution.push(entry);
                assigned = true;
                break;
              }
            }
          }
          
          if (!assigned) {
            // Impossible de planifier ce cours
            unassignedClasses.push({
              ...requirement,
              session,
              reason: 'Pas de créneau ou salle disponible'
            });
          }
        }
      }
      
      return { solution, unassignedClasses };
    }
    
    /**
     * Initialise la matrice d'assignation des classes
     * @param {Array} timeSlots Liste des créneaux horaires
     * @param {Array} classGroups Liste des classes
     * @returns {Object} Matrice d'assignation
     * @private
     */
    _initAssignments(timeSlots, classGroups) {
      const assignments = {};
      
      for (const classGroup of classGroups) {
        assignments[classGroup.id] = {};
        for (const timeSlot of timeSlots) {
          assignments[classGroup.id][timeSlot.id] = false;
        }
      }
      
      return assignments;
    }
    
    /**
     * Initialise la matrice d'assignation des enseignants
     * @param {Array} timeSlots Liste des créneaux horaires
     * @param {Array} teachers Liste des enseignants
     * @returns {Object} Matrice d'assignation
     * @private
     */
    _initTeacherAssignments(timeSlots, teachers) {
      const assignments = {};
      
      for (const teacher of teachers) {
        assignments[teacher.id] = {};
        for (const timeSlot of timeSlots) {
          // Vérifier les disponibilités de l'enseignant
          const isAvailable = this._isTeacherAvailable(teacher, timeSlot);
          assignments[teacher.id][timeSlot.id] = isAvailable ? false : true;
        }
      }
      
      return assignments;
    }
    
    /**
     * Vérifie si un enseignant est disponible sur un créneau horaire
     * @param {Object} teacher Enseignant
     * @param {Object} timeSlot Créneau horaire
     * @returns {boolean} Disponibilité
     * @private
     */
    _isTeacherAvailable(teacher, timeSlot) {
      if (!teacher.TeacherAvailabilities || teacher.TeacherAvailabilities.length === 0) {
        return true; // Par défaut, disponible si aucune information
      }
      
      // Vérifie les disponibilités spécifiques à ce jour et cette heure
      for (const availability of teacher.TeacherAvailabilities) {
        if (
          availability.day === timeSlot.day &&
          new Date(`1970-01-01T${availability.startTime}`) <= new Date(`1970-01-01T${timeSlot.startTime}`) &&
          new Date(`1970-01-01T${availability.endTime}`) >= new Date(`1970-01-01T${timeSlot.endTime}`)
        ) {
          return availability.isAvailable;
        }
      }
      
      return true; // Par défaut disponible si pas de règle spécifique
    }
    
    /**
     * Initialise la matrice d'assignation des salles
     * @param {Array} timeSlots Liste des créneaux horaires
     * @param {Array} rooms Liste des salles
     * @returns {Object} Matrice d'assignation
     * @private
     */
    _initRoomAssignments(timeSlots, rooms) {
      const assignments = {};
      
      for (const room of rooms) {
        assignments[room.id] = {};
        for (const timeSlot of timeSlots) {
          assignments[room.id][timeSlot.id] = false;
        }
      }
      
      return assignments;
    }
    
    /**
     * Trouve les enseignants qualifiés pour une matière
     * @param {Array} teachers Liste des enseignants
     * @param {number} subjectId ID de la matière
     * @returns {Array} Enseignants éligibles
     * @private
     */
    _findEligibleTeachers(teachers, subjectId) {
      return teachers.filter(teacher => {
        return teacher.Subjects.some(subject => subject.id === subjectId);
      });
    }
    
    /**
     * Compte le nombre d'heures déjà assignées à un enseignant
     * @param {Object} teacherAssignments Matrice d'assignation des enseignants
     * @param {number} teacherId ID de l'enseignant
     * @returns {number} Nombre d'heures assignées
     * @private
     */
    _countTeacherHours(teacherAssignments, teacherId) {
      let count = 0;
      
      for (const timeSlotId in teacherAssignments[teacherId]) {
        if (teacherAssignments[teacherId][timeSlotId]) {
          count++;
        }
      }
      
      return count;
    }
    
    /**
     * Trouve un créneau disponible pour un cours
     * @param {Array} timeSlots Liste des créneaux horaires
     * @param {Object} assignments Matrice d'assignation des classes
     * @param {Object} teacherAssignments Matrice d'assignation des enseignants
     * @param {Object} roomAssignments Matrice d'assignation des salles
     * @param {number} classGroupId ID de la classe
     * @param {number} teacherId ID de l'enseignant
     * @param {Array} constraints Liste des contraintes
     * @returns {Object|null} Créneau disponible ou null
     * @private
     */
    _findAvailableSlot(
      timeSlots,
      assignments,
      teacherAssignments,
      roomAssignments,
      classGroupId,
      teacherId,
      constraints
    ) {
      // Trie les créneaux de manière aléatoire pour éviter les concentrations
      const shuffledTimeSlots = [...timeSlots].sort(() => 0.5 - Math.random());
      
      for (const timeSlot of shuffledTimeSlots) {
        // Vérifie si le créneau est disponible pour la classe et l'enseignant
        if (!assignments[classGroupId][timeSlot.id] && !teacherAssignments[teacherId][timeSlot.id]) {
          // Vérifie les contraintes
          if (this._checkConstraints(constraints, classGroupId, teacherId, timeSlot.id)) {
            return { timeSlotId: timeSlot.id };
          }
        }
      }
      
      return null;
    }
    
    /**
     * Trouve une salle disponible pour un cours
     * @param {Array} rooms Liste des salles
     * @param {Object} roomAssignments Matrice d'assignation des salles
     * @param {number} timeSlotId ID du créneau horaire
     * @param {number} subjectId ID de la matière
     * @param {Array} constraints Liste des contraintes
     * @returns {Object|null} Salle disponible ou null
     * @private
     */
    _findAvailableRoom(
      rooms,
      roomAssignments,
      timeSlotId,
      subjectId,
      constraints
    ) {
      // Vérifie si certaines matières nécessitent des salles spécifiques
      const specificRoomConstraint = constraints.find(c => 
        c.type === 'specific_room_required' && 
        c.parameters && 
        c.parameters.subjectId === subjectId
      );
      
      if (specificRoomConstraint) {
        // Cette matière nécessite une salle spécifique
        const specificRooms = rooms.filter(r => 
          r.type === specificRoomConstraint.parameters.roomType
        );
        
        for (const room of specificRooms) {
          if (!roomAssignments[room.id][timeSlotId]) {
            return room;
          }
        }
        
        return null; // Pas de salle spécifique disponible
      }
      
      // Pour les matières générales, n'importe quelle salle disponible convient
      for (const room of rooms) {
        if (!roomAssignments[room.id][timeSlotId]) {
          return room;
        }
      }
      
      return null;
    }
    
    /**
     * Vérifie les contraintes pour une assignation
     * @param {Array} constraints Liste des contraintes
     * @param {number} classGroupId ID de la classe
     * @param {number} teacherId ID de l'enseignant
     * @param {number} timeSlotId ID du créneau horaire
     * @returns {boolean} Validité de l'assignation
     * @private
     */
    _checkConstraints(constraints, classGroupId, teacherId, timeSlotId) {
      // Vérifie chaque contrainte applicable
      for (const constraint of constraints) {
        if (constraint.priority === 'hard') {
          // Traitement des contraintes dures
          switch (constraint.type) {
            case 'teacher_unavailable':
              if (
                constraint.teacherId === teacherId && 
                constraint.parameters && 
                constraint.parameters.timeSlotIds.includes(timeSlotId)
              ) {
                return false;
              }
              break;
              
            case 'room_unavailable':
              // Géré dans _findAvailableRoom
              break;
              
            case 'max_hours_per_day':
              // Nécessiterait de compter le nombre de cours déjà programmés ce jour
              // Pour simplifier, on ignore cette contrainte ici
              break;
          }
        }
        // Les contraintes souples sont ignorées pour l'instant
      }
      
      return true;
    }
    
    /**
     * Calcule le score d'une solution en fonction des contraintes souples
     * @param {Array} solution Solution à évaluer
     * @param {Array} constraints Liste des contraintes
     * @returns {number} Score de la solution
     * @private
     */
    _calculateSolutionScore(solution, constraints) {
      let score = 0;
      
      // Pour chaque contrainte souple
      const softConstraints = constraints.filter(c => c.priority === 'soft');
      
      for (const constraint of softConstraints) {
        // Évaluation des contraintes souples
        switch (constraint.type) {
          case 'consecutive_classes':
            score += this._evaluateConsecutiveClasses(solution, constraint);
            break;
            
          case 'same_day_classes':
            score += this._evaluateSameDayClasses(solution, constraint);
            break;
        }
      }
      
      return score;
    }
    
    /**
     * Évalue la contrainte de cours consécutifs
     * @param {Array} solution Solution à évaluer
     * @param {Object} constraint Contrainte à évaluer
     * @returns {number} Score partiel
     * @private
     */
    _evaluateConsecutiveClasses(solution, constraint) {
      // Implémentation à faire
      return 0;
    }
    
    /**
     * Évalue la contrainte de cours le même jour
     * @param {Array} solution Solution à évaluer
     * @param {Object} constraint Contrainte à évaluer
     * @returns {number} Score partiel
     * @private
     */
    _evaluateSameDayClasses(solution, constraint) {
      // Implémentation à faire
      return 0;
    }
  }
  
  module.exports = new SchedulerService();