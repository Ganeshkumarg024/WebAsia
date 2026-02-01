import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FinancialLog = sequelize.define('FinancialLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('revenue', 'payout', 'refund', 'expense'),
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING, // e.g., 'subscription', 'affiliate_payout', 'designer_payment'
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'INR',
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
        defaultValue: 'pending',
    },
    paymentId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'payment_id',
        references: {
            model: 'payments',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    relatedId: {
        type: DataTypes.UUID, // e.g., SubscriptionId or ReferralId
        allowNull: true,
        field: 'related_id'
    },
    description: {
        type: DataTypes.TEXT,
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'financial_logs',
});

export default FinancialLog;
