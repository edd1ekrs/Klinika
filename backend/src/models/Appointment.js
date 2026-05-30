const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: { type: DataTypes.UUID, allowNull: false },
  doctor_id: { type: DataTypes.UUID, allowNull: false },
  service_id: { type: DataTypes.UUID, allowNull: false },
  scheduled_at: { type: DataTypes.DATE, allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, defaultValue: 30 },
  status: { type: DataTypes.ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'), defaultValue: 'scheduled' },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'appointments',
  timestamps: true,
  underscored: true,
});

module.exports = Appointment;
