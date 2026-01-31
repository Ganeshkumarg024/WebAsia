import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    requestId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'request_id',
        references: {
            model: 'requests',
            key: 'id'
        }
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'sender_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    messageType: {
        type: DataTypes.ENUM('text', 'file', 'system'),
        defaultValue: 'text',
        field: 'message_type'
    },
    fileId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'file_id',
        references: {
            model: 'files',
            key: 'id'
        }
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
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: 'messages',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['request_id'] },
        { fields: ['sender_id'] },
        { fields: ['created_at'] },
        { fields: ['is_read'] }
    ]
});

export default Message;
