const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Patient', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
  phone: { type: DataTypes.STRING(20), allowNull: false },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: false },
  gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: false },
  address: DataTypes.TEXT,
  emergencyContact: DataTypes.STRING,
  bloodType: DataTypes.STRING(5),
  allergies: { type: DataTypes.JSON, defaultValue: [] }
}, { tableName: 'patients', timestamps: true });
