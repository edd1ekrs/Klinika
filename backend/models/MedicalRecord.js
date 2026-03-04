const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('MedicalRecord', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patientId: { type: DataTypes.UUID, allowNull: false },
  doctorId: { type: DataTypes.UUID, allowNull: false },
  appointmentId: DataTypes.UUID,
  diagnosis: { type: DataTypes.TEXT, allowNull: false },
  symptoms: { type: DataTypes.JSON, defaultValue: [] },
  prescription: DataTypes.TEXT,
  treatmentPlan: DataTypes.TEXT,
  attachments: { type: DataTypes.JSON, defaultValue: [] },
  isConfidential: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'medical_records', timestamps: true });
