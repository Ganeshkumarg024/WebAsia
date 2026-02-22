import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PushSubscription = sequelize.define('PushSubscription', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    endpoint: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    p256dh: {
        type: DataTypes.STRING,
        allowNull: false
    },
    auth: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deviceType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'device_type'
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'user_agent'
    },
    lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_used_at',
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'push_subscriptions',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['endpoint'] }
    ]
});

export default PushSubscription;
