import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
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
    subscriptionId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'subscription_id',
        references: {
            model: 'subscriptions',
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
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'),
        defaultValue: 'pending'
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'payment_method',
        comment: 'card, upi, netbanking, wallet'
    },
    paymentGateway: {
        type: DataTypes.ENUM('razorpay', 'stripe', 'manual', 'admin'),
        allowNull: false,
        field: 'payment_gateway'
    },
    gatewayOrderId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'gateway_order_id'
    },
    gatewayPaymentId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'gateway_payment_id'
    },
    gatewaySignature: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'gateway_signature'
    },
    invoiceNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        field: 'invoice_number'
    },
    invoiceUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'invoice_url'
    },
    receiptUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'receipt_url'
    },
    refundAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'refund_amount'
    },
    refundReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'refund_reason'
    },
    refundedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'refunded_at'
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional payment details'
    },
    failureReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'failure_reason'
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'paid_at'
    }
}, {
    tableName: 'payments',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['subscription_id'] },
        { fields: ['status'] },
        { fields: ['gateway_order_id'] },
        { fields: ['gateway_payment_id'] },
        { fields: ['invoice_number'], unique: true }
    ]
});

export default Payment;
