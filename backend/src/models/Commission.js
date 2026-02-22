import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Commission = sequelize.define('Commission', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    affiliateId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'affiliate_id',
        references: {
            model: 'affiliates',
            key: 'id'
        }
    },
    referralId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'referral_id',
        references: {
            model: 'referrals',
            key: 'id'
        }
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
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Commission rate applied (e.g., 15.00 for 15%)'
    },
    type: {
        type: DataTypes.ENUM('b2c', 'b2b'),
        defaultValue: 'b2c'
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'paid', 'cancelled'),
        defaultValue: 'pending'
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'INR'
    },
    paymentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'payment_amount',
        comment: 'Original payment amount the commission was calculated from'
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
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'paid_at'
    },
    payoutId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'payout_id',
        comment: 'Links to the payout batch this commission was paid in'
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: 'commissions',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['affiliate_id'] },
        { fields: ['referral_id'] },
        { fields: ['payment_id'] },
        { fields: ['status'] },
        { fields: ['payout_id'] }
    ]
});

export default Commission;
