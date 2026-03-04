const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Doctor', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
  phone: DataTypes.STRING(20),
  specialization: { type: DataTypes.STRING, allowNull: false },
  licenseNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
  avatar: DataTypes.STRING,
  bio: DataTypes.TEXT,
  consultationFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'doctors', timestamps: true });
