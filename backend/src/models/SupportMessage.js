import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SupportMessage = sequelize.define('SupportMessage', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    clientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'client_id',
        references: {
            model: 'users',
            key: 'id'
        }
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
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    senderType: {
        type: DataTypes.ENUM('client', 'admin'),
        allowNull: false,
        field: 'sender_type'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_read'
    }
}, {
    tableName: 'support_messages',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['client_id'] },
        { fields: ['admin_id'] },
        { fields: ['created_at'] },
        { fields: ['is_read'] }
    ]
});

export default SupportMessage;
