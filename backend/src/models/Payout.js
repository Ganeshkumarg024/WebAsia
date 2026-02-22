import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payout = sequelize.define('Payout', {
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
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'INR'
    },
    status: {
        type: DataTypes.ENUM('requested', 'approved', 'processing', 'paid', 'rejected'),
        defaultValue: 'requested'
    },
    payoutMethod: {
        type: DataTypes.ENUM('bank_transfer', 'upi', 'paypal'),
        allowNull: true,
        field: 'payout_method'
    },
    payoutDetails: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'payout_details',
        comment: 'Bank details, UPI ID, or PayPal email used for this payout'
    },
    transactionRef: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'transaction_ref',
        comment: 'Transaction reference from the actual payment'
    },
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'admin_notes'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason'
    },
    requestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'requested_at'
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
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'processed_at'
    },
    receiptUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'receipt_url'
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: 'payouts',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['affiliate_id'] },
        { fields: ['status'] },
        { fields: ['requested_at'] }
    ]
});

export default Payout;
