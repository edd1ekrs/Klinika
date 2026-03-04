const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const User = require('./User')(sequelize);
const RefreshToken = require('./RefreshToken')(sequelize);
const Patient = require('./Patient')(sequelize);
const Doctor = require('./Doctor')(sequelize);
const Service = require('./Service')(sequelize);
const Appointment = require('./Appointment')(sequelize);
const Payment = require('./Payment')(sequelize);
const MedicalRecord = require('./MedicalRecord')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);

// Associations
User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

Doctor.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Doctor, { foreignKey: 'userId' });

Appointment.belongsTo(Patient, { foreignKey: 'patientId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId' });
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });

Payment.belongsTo(Appointment, { foreignKey: 'appointmentId' });
Payment.belongsTo(Patient, { foreignKey: 'patientId' });
Appointment.hasOne(Payment, { foreignKey: 'appointmentId' });

MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctorId' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointmentId' });
Patient.hasMany(MedicalRecord, { foreignKey: 'patientId' });

module.exports = { sequelize, User, RefreshToken, Patient, Doctor, Service, Appointment, Payment, MedicalRecord, AuditLog };
