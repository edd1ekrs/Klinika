const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: { type: DataTypes.UUID, allowNull: false },
  doctor_id: { type: DataTypes.UUID, allowNull: false },
  appointment_id: { type: DataTypes.UUID, allowNull: true },
  diagnosis: { type: DataTypes.TEXT, allowNull: false },
  symptoms: { type: DataTypes.JSON, allowNull: true },
  prescription: { type: DataTypes.TEXT, allowNull: true },
  treatment_plan: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'medical_records',
  timestamps: true,
  underscored: true,
});

module.exports = MedicalRecord;
