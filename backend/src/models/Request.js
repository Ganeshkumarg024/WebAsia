import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Request = sequelize.define('Request', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
    subscriptionId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'subscription_id',
        references: {
            model: 'subscriptions',
            key: 'id'
        }
    },
    serviceType: {
        type: DataTypes.ENUM('graphic_design', 'video_production', 'social_media', 'web_development', 'branding'),
        allowNull: false,
        field: 'service_type'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    specifications: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM(
            'queued', 'active', 'assigned', 'in_progress',
            'pending_review', 'client_review', 'revision_requested',
            'completed', 'cancelled'
        ),
        defaultValue: 'queued'
    },
    priority: {
        type: DataTypes.ENUM('normal', 'urgent'),
        defaultValue: 'normal'
    },
    queuePosition: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'queue_position'
    },
    assignedDesignerId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'assigned_designer_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    assignedManagerId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'assigned_manager_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    assignedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'assigned_at'
    },
    slaHours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'sla_hours'
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'started_at'
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'completed_at'
    },
    creditsCost: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'credits_cost'
    },
    isFlagged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_flagged'
    },
    flagReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'flag_reason'
    }
}, {
    tableName: 'requests',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['client_id'] },
        { fields: ['assigned_designer_id'] },
        { fields: ['assigned_manager_id'] },
        { fields: ['status'] },
        { fields: ['service_type'] },
        { fields: ['deadline'] }
    ]
});

export default Request;
