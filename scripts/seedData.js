// scripts/seedData.js

const { 
    Teacher, 
    Subject, 
    ClassGroup, 
    Room, 
    TimeSlot, 
    TeacherSubject,
    TeacherAvailability,
    Constraint,
    sequelize 
  } = require('../models');
  
  /**
   * Fonction qui génère des données de test
   */
  const seedData = async () => {
    try {
      // Synchroniser les modèles avec la base de données (ATTENTION: supprime les données existantes)
      await sequelize.sync({ force: true });
      console.log('Base de données réinitialisée');
  
      // Création des matières
      const subjects = await Subject.bulkCreate([
        { name: 'Français', color: '#FF5733' },
        { name: 'Mathématiques', color: '#337DFF' },
        { name: 'Histoire-Géographie', color: '#FFC300' },
        { name: 'Sciences Physiques', color: '#C70039' },
        { name: 'SVT', color: '#2ECC71' },
        { name: 'Anglais', color: '#9B59B6' },
        { name: 'Espagnol', color: '#F1C40F' },
        { name: 'Technologie', color: '#34495E' },
        { name: 'Arts Plastiques', color: '#E74C3C' },
        { name: 'Musique', color: '#8E44AD' },
        { name: 'EPS', color: '#16A085' },
        { name: 'Philosophie', color: '#7D3C98' },
        { name: 'SES', color: '#D35400' },
        { name: 'Sport', color: '#1ABC9C' },
        { name: 'Arts', color: '#E74C3C' },
        { name: 'Sciences', color: '#2ECC71' }
      ]);
      console.log('Matières créées');
  
      // Création des enseignants
      const teachers = await Teacher.bulkCreate([
        { firstName: 'Marie', lastName: 'Dupont', email: 'marie.dupont@ecole.fr', hoursPerWeek: 18 },
        { firstName: 'Jean', lastName: 'Martin', email: 'jean.martin@ecole.fr', hoursPerWeek: 20 },
        { firstName: 'Sophie', lastName: 'Lambert', email: 'sophie.lambert@ecole.fr', hoursPerWeek: 15 },
        { firstName: 'Nicolas', lastName: 'Petit', email: 'nicolas.petit@ecole.fr', hoursPerWeek: 18 },
        { firstName: 'Isabelle', lastName: 'Leroy', email: 'isabelle.leroy@ecole.fr', hoursPerWeek: 20 },
        { firstName: 'Pierre', lastName: 'Moreau', email: 'pierre.moreau@ecole.fr', hoursPerWeek: 16 },
        { firstName: 'Catherine', lastName: 'Dubois', email: 'catherine.dubois@ecole.fr', hoursPerWeek: 18 },
        { firstName: 'Thomas', lastName: 'Bernard', email: 'thomas.bernard@ecole.fr', hoursPerWeek: 20 },
        { firstName: 'Julie', lastName: 'Richard', email: 'julie.richard@ecole.fr', hoursPerWeek: 15 },
        { firstName: 'David', lastName: 'Robert', email: 'david.robert@ecole.fr', hoursPerWeek: 18 }
      ]);
      console.log('Enseignants créés');
  
      // Assignation des matières aux enseignants
      const teacherSubjects = [
        { TeacherId: 1, SubjectId: 1, hoursPerWeek: 15, isPrimary: true }, // Marie Dupont - Français
        { TeacherId: 2, SubjectId: 2, hoursPerWeek: 15, isPrimary: true }, // Jean Martin - Mathématiques
        { TeacherId: 3, SubjectId: 3, hoursPerWeek: 12, isPrimary: true }, // Sophie Lambert - Histoire-Géographie
        { TeacherId: 4, SubjectId: 4, hoursPerWeek: 12, isPrimary: true }, // Nicolas Petit - Sciences Physiques
        { TeacherId: 5, SubjectId: 5, hoursPerWeek: 12, isPrimary: true }, // Isabelle Leroy - SVT
        { TeacherId: 6, SubjectId: 6, hoursPerWeek: 15, isPrimary: true }, // Pierre Moreau - Anglais
        { TeacherId: 7, SubjectId: 7, hoursPerWeek: 15, isPrimary: true }, // Catherine Dubois - Espagnol
        { TeacherId: 8, SubjectId: 8, hoursPerWeek: 10, isPrimary: true }, // Thomas Bernard - Technologie
        { TeacherId: 9, SubjectId: 9, hoursPerWeek: 8, isPrimary: true },  // Julie Richard - Arts Plastiques
        { TeacherId: 10, SubjectId: 10, hoursPerWeek: 8, isPrimary: true }, // David Robert - Musique
        { TeacherId: 3, SubjectId: 11, hoursPerWeek: 3, isPrimary: false }, // Sophie Lambert - EPS (secondaire)
        { TeacherId: 1, SubjectId: 12, hoursPerWeek: 3, isPrimary: false }, // Marie Dupont - Philosophie (secondaire)
        { TeacherId: 2, SubjectId: 13, hoursPerWeek: 5, isPrimary: false }, // Jean Martin - SES (secondaire)
      ];
  
      for (const ts of teacherSubjects) {
        await TeacherSubject.create(ts);
      }
      console.log('Matières assignées aux enseignants');
  
      // Création des classes
      const classGroups = await ClassGroup.bulkCreate([
        { name: '6ème A', level: '6ème', numberOfStudents: 25 },
        { name: '6ème B', level: '6ème', numberOfStudents: 26 },
        { name: '5ème A', level: '5ème', numberOfStudents: 24 },
        { name: '5ème B', level: '5ème', numberOfStudents: 25 },
        { name: '4ème A', level: '4ème', numberOfStudents: 28 },
        { name: '4ème B', level: '4ème', numberOfStudents: 27 },
        { name: '3ème A', level: '3ème', numberOfStudents: 30 },
        { name: '3ème B', level: '3ème', numberOfStudents: 29 }
      ]);
      console.log('Classes créées');
  
      // Création des salles
      const rooms = await Room.bulkCreate([
        { name: 'A101', capacity: 30, type: 'standard', building: 'A', floor: '1' },
        { name: 'A102', capacity: 30, type: 'standard', building: 'A', floor: '1' },
        { name: 'A103', capacity: 30, type: 'standard', building: 'A', floor: '1' },
        { name: 'A201', capacity: 30, type: 'standard', building: 'A', floor: '2' },
        { name: 'A202', capacity: 30, type: 'standard', building: 'A', floor: '2' },
        { name: 'A203', capacity: 30, type: 'standard', building: 'A', floor: '2' },
        { name: 'B101', capacity: 25, type: 'lab', building: 'B', floor: '1' },
        { name: 'B102', capacity: 25, type: 'lab', building: 'B', floor: '1' },
        { name: 'C101', capacity: 30, type: 'computer', building: 'C', floor: '1' },
        { name: 'D101', capacity: 50, type: 'gym', building: 'D', floor: '1' }
      ]);
      console.log('Salles créées');
  
      // Création des créneaux horaires (pour une semaine typique)
      const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
      const timeSlots = [];
  
      for (const day of daysOfWeek) {
        // Cours du matin
        timeSlots.push({ day, startTime: '08:00:00', endTime: '09:00:00', isBreak: false });
        timeSlots.push({ day, startTime: '09:00:00', endTime: '10:00:00', isBreak: false });
        timeSlots.push({ day, startTime: '10:00:00', endTime: '10:15:00', isBreak: true }); // Pause
        timeSlots.push({ day, startTime: '10:15:00', endTime: '11:15:00', isBreak: false });
        timeSlots.push({ day, startTime: '11:15:00', endTime: '12:15:00', isBreak: false });
        
        // Pause déjeuner
        timeSlots.push({ day, startTime: '12:15:00', endTime: '13:45:00', isBreak: true });
        
        // Cours de l'après-midi (sauf mercredi)
        if (day !== 'Mercredi') {
          timeSlots.push({ day, startTime: '13:45:00', endTime: '14:45:00', isBreak: false });
          timeSlots.push({ day, startTime: '14:45:00', endTime: '15:45:00', isBreak: false });
          timeSlots.push({ day, startTime: '15:45:00', endTime: '16:00:00', isBreak: true }); // Pause
          timeSlots.push({ day, startTime: '16:00:00', endTime: '17:00:00', isBreak: false });
        }
      }
  
      await TimeSlot.bulkCreate(timeSlots);
      console.log('Créneaux horaires créés');
  
      // Création de quelques contraintes
      const constraints = await Constraint.bulkCreate([
        {
          type: 'specific_room_required',
          priority: 'hard',
          parameters: { subjectId: 4, roomType: 'lab' }, // Sciences Physiques nécessite un labo
          description: 'Les cours de Sciences Physiques doivent avoir lieu dans un laboratoire'
        },
        {
          type: 'specific_room_required',
          priority: 'hard',
          parameters: { subjectId: 5, roomType: 'lab' }, // SVT nécessite un labo
          description: 'Les cours de SVT doivent avoir lieu dans un laboratoire'
        },
        {
          type: 'specific_room_required',
          priority: 'hard',
          parameters: { subjectId: 8, roomType: 'computer' }, // Technologie nécessite une salle informatique
          description: 'Les cours de Technologie doivent avoir lieu dans une salle informatique'
        },
        {
          type: 'specific_room_required',
          priority: 'hard',
          parameters: { subjectId: 11, roomType: 'gym' }, // EPS nécessite un gymnase
          description: 'Les cours d\'EPS doivent avoir lieu dans un gymnase'
        },
        {
          type: 'max_hours_per_day',
          priority: 'soft',
          parameters: { maxHours: 6 },
          weight: 3,
          description: 'Maximum 6 heures de cours par jour pour une classe'
        },
        {
          type: 'max_hours_per_day',
          priority: 'soft',
          parameters: { maxHours: 6 },
          weight: 2,
          description: 'Maximum 6 heures de cours par jour pour un enseignant'
        },
        {
          type: 'consecutive_classes',
          priority: 'soft',
          parameters: { maxConsecutive: 3 },
          weight: 2,
          description: 'Éviter plus de 3 heures consécutives pour un enseignant'
        }
      ]);
      console.log('Contraintes créées');
  
      // Ajout de quelques disponibilités d'enseignants
      const availabilities = [
        {
          TeacherId: 1, // Marie Dupont n'est pas disponible le mercredi matin
          day: 'Mercredi',
          startTime: '08:00:00',
          endTime: '13:45:00',
          isAvailable: false,
          preference: 'unavailable'
        },
        {
          TeacherId: 3, // Sophie Lambert préfère enseigner le matin
          day: 'Lundi',
          startTime: '13:45:00',
          endTime: '17:00:00',
          isAvailable: true,
          preference: 'low'
        },
        {
          TeacherId: 3, // Sophie Lambert préfère enseigner le matin
          day: 'Mardi',
          startTime: '13:45:00',
          endTime: '17:00:00',
          isAvailable: true,
          preference: 'low'
        },
        {
          TeacherId: 3, // Sophie Lambert préfère enseigner le matin
          day: 'Jeudi',
          startTime: '13:45:00',
          endTime: '17:00:00',
          isAvailable: true,
          preference: 'low'
        },
        {
          TeacherId: 3, // Sophie Lambert préfère enseigner le matin
          day: 'Vendredi',
          startTime: '13:45:00',
          endTime: '17:00:00',
          isAvailable: true,
          preference: 'low'
        },
        {
          TeacherId: 6, // Pierre Moreau n'est pas disponible le vendredi après-midi
          day: 'Vendredi',
          startTime: '13:45:00',
          endTime: '17:00:00',
          isAvailable: false,
          preference: 'unavailable'
        }
      ];
  
      await TeacherAvailability.bulkCreate(availabilities);
      console.log('Disponibilités des enseignants créées');
  
      console.log('Données de test générées avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération des données de test:', error);
    } finally {
      // Fermer la connexion
      await sequelize.close();
    }
  };
  
  // Exécuter la fonction si ce script est exécuté directement
  if (require.main === module) {
    seedData().then(() => {
      console.log('Script terminé');
      process.exit(0);
    }).catch(err => {
      console.error('Erreur:', err);
      process.exit(1);
    });
  }
  
  module.exports = seedData;