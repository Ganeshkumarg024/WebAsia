import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Subscription = sequelize.define('Subscription', {
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
    planId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'plan_id',
        references: {
            model: 'subscription_plans',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'paused', 'cancelled', 'expired', 'past_due'),
        defaultValue: 'active'
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'start_date'
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'end_date'
    },
    nextBillingDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'next_billing_date'
    },
    autoRenew: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'auto_renew'
    },
    graphicsCreditsRemaining: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'graphics_credits_remaining'
    },
    videoCreditsRemaining: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'video_credits_remaining'
    },
    webCreditsRemaining: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'web_credits_remaining'
    },
    creditsResetDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'credits_reset_date'
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'payment_method'
    },
    paymentId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'payment_id'
    },
    cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'cancelled_at'
    },
    cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'cancellation_reason'
    }
}, {
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['status'] },
        { fields: ['next_billing_date'] }
    ]
});

export default Subscription;
