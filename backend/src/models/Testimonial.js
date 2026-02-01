import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Testimonial = sequelize.define('Testimonial', {
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
    requestId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'request_id',
        references: {
            model: 'requests',
            key: 'id'
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    serviceType: {
        type: DataTypes.ENUM('graphic_design', 'video_production', 'social_media', 'web_development', 'branding'),
        allowNull: true,
        field: 'service_type'
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_public',
        comment: 'User consent to display on website'
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'archived'),
        defaultValue: 'pending'
    },
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'approved_at'
    },
    approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'approved_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason'
    },
    featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Featured on homepage'
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'display_order'
    }
}, {
    tableName: 'testimonials',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['request_id'] },
        { fields: ['status'] },
        { fields: ['is_public'] },
        { fields: ['featured'] },
        { fields: ['rating'] }
    ]
});

export default Testimonial;
