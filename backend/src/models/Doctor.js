const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  specialization: { type: DataTypes.STRING, allowNull: false },
  license_number: { type: DataTypes.STRING, allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  consultation_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  experience_years: { type: DataTypes.INTEGER, defaultValue: 0 },
  availability_status: { type: DataTypes.ENUM('available', 'busy', 'offline'), defaultValue: 'available' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'doctors',
  timestamps: true,
  underscored: true,
});

module.exports = Doctor;
