const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
  gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  blood_type: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'patients',
  timestamps: true,
  underscored: true,
});

module.exports = Patient;
