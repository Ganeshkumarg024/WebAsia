import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
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
    type: {
        type: DataTypes.ENUM(
            'request_created',
            'request_assigned',
            'request_status_changed',
            'message_received',
            'file_uploaded',
            'payment_received',
            'subscription_expiring',
            'credit_low',
            'system'
        ),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    relatedId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'related_id'
    },
    relatedType: {
        type: DataTypes.ENUM('request', 'subscription', 'payment', 'file', 'message'),
        allowNull: true,
        field: 'related_type'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_read'
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'read_at'
    },
    actionUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'action_url'
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['type'] },
        { fields: ['is_read'] },
        { fields: ['created_at'] }
    ]
});

export default Notification;
