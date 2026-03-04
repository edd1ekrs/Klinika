const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'doctor', 'staff'), defaultValue: 'staff' },
  avatar: DataTypes.STRING,
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'users', timestamps: true });
