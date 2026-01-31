import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'INR'
    },
    duration: {
        type: DataTypes.ENUM('weekly', 'monthly', 'quarterly', 'yearly', 'custom'),
        allowNull: false
    },
    activeRequestLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'active_request_limit'
    },
    monthlyGraphicsCredits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'monthly_graphics_credits'
    },
    monthlyVideoCredits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'monthly_video_credits'
    },
    monthlyWebCredits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'monthly_web_credits'
    },
    turnaroundHours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'turnaround_hours'
    },
    features: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_public'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'archived'),
        defaultValue: 'active'
    }
}, {
    tableName: 'subscription_plans',
    timestamps: true,
    underscored: true
});

export default SubscriptionPlan;
