const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Appointment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patientId: { type: DataTypes.UUID, allowNull: false },
  doctorId: { type: DataTypes.UUID, allowNull: false },
  serviceId: { type: DataTypes.UUID, allowNull: false },
  scheduledAt: { type: DataTypes.DATE, allowNull: false },
  duration: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('scheduled','confirmed','in-progress','completed','cancelled','no-show'), defaultValue: 'scheduled' },
  notes: DataTypes.TEXT
}, { tableName: 'appointments', timestamps: true });
