import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Referral = sequelize.define('Referral', {
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
    referredUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'referred_user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    referredEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'referred_email'
    },
    status: {
        type: DataTypes.ENUM('clicked', 'registered', 'subscribed', 'converted', 'cancelled'),
        defaultValue: 'clicked'
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
    commissionAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'commission_amount'
    },
    commissionPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'commission_paid'
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'paid_at'
    },
    clickedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'clicked_at'
    },
    registeredAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'registered_at'
    },
    convertedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'converted_at'
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'IP address, user agent, UTM parameters'
    }
}, {
    tableName: 'referrals',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['affiliate_id'] },
        { fields: ['referred_user_id'] },
        { fields: ['status'] },
        { fields: ['commission_paid'] }
    ]
});

export default Referral;
