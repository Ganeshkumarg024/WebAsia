import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SystemLog = sequelize.define('SystemLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    adminId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'admin_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    targetType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'target_type'
    },
    targetId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'target_id'
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'ip_address'
    },
    userAgent: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'user_agent'
    }
}, {
    tableName: 'system_logs',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
        { fields: ['admin_id'] },
        { fields: ['action'] },
        { fields: ['target_type', 'target_id'] },
        { fields: ['created_at'] }
    ]
});

export default SystemLog;
