import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Affiliate = sequelize.define('Affiliate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    referralCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'referral_code'
    },
    commissionRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 15.00,
        field: 'commission_rate',
        comment: 'Commission percentage (e.g., 15.00 for 15%)'
    },
    totalReferrals: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_referrals'
    },
    successfulConversions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'successful_conversions'
    },
    totalEarnings: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        field: 'total_earnings'
    },
    pendingEarnings: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        field: 'pending_earnings'
    },
    paidEarnings: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        field: 'paid_earnings'
    },
    payoutDetails: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'payout_details',
        comment: 'Bank account, UPI, PayPal details'
    },
    status: {
        type: DataTypes.ENUM('active', 'suspended', 'inactive'),
        defaultValue: 'active'
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
    }
}, {
    tableName: 'affiliates',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'], unique: true },
        { fields: ['referral_code'], unique: true },
        { fields: ['status'] }
    ]
});

export default Affiliate;
