const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('RefreshToken', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  token: { type: DataTypes.STRING(500), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false }
}, { tableName: 'refresh_tokens', timestamps: true });
