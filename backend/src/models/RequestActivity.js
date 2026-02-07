import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RequestActivity = sequelize.define('RequestActivity', {
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
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    activityType: {
        type: DataTypes.ENUM(
            'created',
            'status_changed',
            'assigned',
            'reassigned',
            'designer_assigned',
            'manager_assigned',
            'started',
            'file_uploaded',
            'submitted_for_review',
            'approved_by_manager',
            'rejected_by_manager',
            'sent_to_client',
            'feedback_received',
            'revision_requested',
            'approved_by_client',
            'completed',
            'cancelled',
            'priority_changed',
            'deadline_extended',
            'internal_note',
            'note_added'
        ),
        allowNull: false,
        field: 'activity_type'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional activity details (old/new values, file IDs, etc.)'
    },
    isSystemGenerated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_system_generated'
    }
}, {
    tableName: 'request_activities',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['request_id'] },
        { fields: ['user_id'] },
        { fields: ['activity_type'] },
        { fields: ['created_at'] }
    ]
});

export default RequestActivity;
