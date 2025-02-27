// models/index.js (mis à jour)
const { sequelize } = require('../config/database');

// Import des modèles
const Teacher = require('./Teacher');
const Subject = require('./Subject');
const ClassGroup = require('./ClassGroup');
const Room = require('./Room');
const TimeSlot = require('./TimeSlot');
const TeacherSubject = require('./TeacherSubject');
const TeacherAvailability = require('./TeacherAvailability');
const Schedule = require('./Schedule');
const ScheduleEntry = require('./ScheduleEntry');
const Constraint = require('./Constraint');

// Définition des relations

// Un enseignant peut enseigner plusieurs matières
Teacher.belongsToMany(Subject, { through: TeacherSubject });
Subject.belongsToMany(Teacher, { through: TeacherSubject });

// Un enseignant a plusieurs disponibilités
Teacher.hasMany(TeacherAvailability);
TeacherAvailability.belongsTo(Teacher);

// Une classe peut avoir plusieurs entrées d'emploi du temps
ClassGroup.hasMany(ScheduleEntry);
ScheduleEntry.belongsTo(ClassGroup);

// Une matière apparaît dans plusieurs entrées d'emploi du temps
Subject.hasMany(ScheduleEntry);
ScheduleEntry.belongsTo(Subject);

// Un enseignant peut avoir plusieurs entrées d'emploi du temps
Teacher.hasMany(ScheduleEntry);
ScheduleEntry.belongsTo(Teacher);

// Une salle peut être utilisée dans plusieurs entrées d'emploi du temps
Room.hasMany(ScheduleEntry);
ScheduleEntry.belongsTo(Room);

// Un créneau horaire peut avoir plusieurs entrées d'emploi du temps
TimeSlot.hasMany(ScheduleEntry);
ScheduleEntry.belongsTo(TimeSlot);

// Un emploi du temps a plusieurs entrées
Schedule.hasMany(ScheduleEntry);
ScheduleEntry.belongsTo(Schedule);

// Les contraintes peuvent être liées à différentes entités
Teacher.hasMany(Constraint);
Constraint.belongsTo(Teacher, { as: 'TeacherConstraint', foreignKey: 'teacherId' });

Room.hasMany(Constraint);
Constraint.belongsTo(Room, { as: 'RoomConstraint', foreignKey: 'roomId' });

ClassGroup.hasMany(Constraint);
Constraint.belongsTo(ClassGroup, { as: 'ClassConstraint', foreignKey: 'classGroupId' });

Subject.hasMany(Constraint);
Constraint.belongsTo(Subject, { as: 'SubjectConstraint', foreignKey: 'subjectId' });

// Synchronisation avec la base de données
const syncDatabase = async () => {
  try {
    // Sync all models with { force: true } drops existing tables and re-creates them
    // Use { alter: true } in development to update tables without dropping data
    // Use neither in production
    await sequelize.sync({ alter: true });
    console.log('Base de données synchronisée');
  } catch (error) {
    console.error('Erreur lors de la synchronisation de la base de données:', error);
  }
};

// Créer la fonction de test de connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('Impossible de se connecter à la base de données:', error);
  }
};

module.exports = {
  sequelize,
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
  syncDatabase,
  testConnection
};