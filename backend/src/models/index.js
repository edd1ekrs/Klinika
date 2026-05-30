const sequelize = require('../config/database');
const User = require('./User');
const Doctor = require('./Doctor');
const Service = require('./Service');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');

// Associations
User.hasOne(Patient, { foreignKey: 'user_id', as: 'patient' });
Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Appointment.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Service.hasMany(Appointment, { foreignKey: 'service_id', as: 'appointments' });

MedicalRecord.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

module.exports = { sequelize, User, Doctor, Service, Patient, Appointment, MedicalRecord };
