const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('AuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
  entityType: { type: DataTypes.STRING, allowNull: false },
  entityId: { type: DataTypes.UUID, allowNull: false },
  changes: DataTypes.JSON,
  ipAddress: DataTypes.STRING(45),
  userAgent: DataTypes.STRING(500)
}, { tableName: 'audit_logs', timestamps: true, updatedAt: false });
