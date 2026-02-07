import sequelize from '../config/database.js';
import User from './User.js';
import SubscriptionPlan from './SubscriptionPlan.js';
import Subscription from './Subscription.js';
import Request from './Request.js';
import File from './File.js';
import Message from './Message.js';
import Notification from './Notification.js';
import Affiliate from './Affiliate.js';
import Referral from './Referral.js';
import Testimonial from './Testimonial.js';
import Payment from './Payment.js';
import RequestActivity from './RequestActivity.js';
import BrandAsset from './BrandAsset.js';
import FinancialLog from './FinancialLog.js';
import Lead from './Lead.js';
import BrandKit from './BrandKit.js';
import SupportMessage from './SupportMessage.js';

// User associations
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
User.hasMany(Request, { foreignKey: 'clientId', as: 'clientRequests' });
User.hasMany(Request, { foreignKey: 'assignedDesignerId', as: 'designerRequests' });
User.hasMany(Request, { foreignKey: 'assignedManagerId', as: 'managerRequests' });
User.hasMany(File, { foreignKey: 'uploadedBy', as: 'uploadedFiles' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasOne(Affiliate, { foreignKey: 'userId', as: 'affiliate' });
User.hasMany(Testimonial, { foreignKey: 'userId', as: 'testimonials' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
User.hasMany(RequestActivity, { foreignKey: 'userId', as: 'activities' });
User.hasMany(BrandAsset, { foreignKey: 'userId', as: 'brandAssets' });
User.hasMany(FinancialLog, { foreignKey: 'userId', as: 'financialLogs' });
User.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
User.hasMany(User, { foreignKey: 'managerId', as: 'designers' });
User.hasOne(BrandKit, { foreignKey: 'userId', as: 'brandKit' });
User.hasMany(SupportMessage, { foreignKey: 'clientId', as: 'supportMessagesAsClient' });
User.hasMany(SupportMessage, { foreignKey: 'adminId', as: 'supportMessagesAsAdmin' });

// SubscriptionPlan associations
SubscriptionPlan.hasMany(Subscription, { foreignKey: 'planId', as: 'subscriptions' });

// Subscription associations
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId', as: 'plan' });
Subscription.hasMany(Request, { foreignKey: 'subscriptionId', as: 'requests' });
Subscription.hasMany(Payment, { foreignKey: 'subscriptionId', as: 'payments' });

// Request associations
Request.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
Request.belongsTo(User, { foreignKey: 'assignedDesignerId', as: 'designer' });
Request.belongsTo(User, { foreignKey: 'assignedManagerId', as: 'manager' });
Request.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
Request.hasMany(File, { foreignKey: 'requestId', as: 'files' });
Request.hasMany(Message, { foreignKey: 'requestId', as: 'messages' });
Request.hasMany(Testimonial, { foreignKey: 'requestId', as: 'testimonials' });
Request.hasMany(RequestActivity, { foreignKey: 'requestId', as: 'activities' });

// File associations
File.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });
File.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
File.belongsTo(File, { foreignKey: 'parentFileId', as: 'parentFile' });
File.hasMany(File, { foreignKey: 'parentFileId', as: 'versions' });
File.hasOne(BrandAsset, { foreignKey: 'fileId', as: 'brandAsset' });

// Message associations
Message.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(File, { foreignKey: 'fileId', as: 'file' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Affiliate associations
Affiliate.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Affiliate.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
Affiliate.hasMany(Referral, { foreignKey: 'affiliateId', as: 'referrals' });

// Referral associations
Referral.belongsTo(Affiliate, { foreignKey: 'affiliateId', as: 'affiliate' });
Referral.belongsTo(User, { foreignKey: 'referredUserId', as: 'referredUser' });
Referral.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });

// Testimonial associations
Testimonial.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Testimonial.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });
Testimonial.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

// Payment associations
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
Payment.hasOne(FinancialLog, { foreignKey: 'paymentId', as: 'financialLog' });

// RequestActivity associations
RequestActivity.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });
RequestActivity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// BrandAsset associations
BrandAsset.belongsTo(User, { foreignKey: 'userId', as: 'user' });
BrandAsset.belongsTo(File, { foreignKey: 'fileId', as: 'file' });

// FinancialLog associations
FinancialLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
FinancialLog.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });

// BrandKit associations
BrandKit.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// SupportMessage associations
SupportMessage.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
SupportMessage.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

// Sync database (development only)
export const syncDatabase = async (options = {}) => {
    try {
        await sequelize.sync(options);
        console.log('✅ Database models synchronized');
    } catch (error) {
        console.error('❌ Database sync error:', error);
        throw error;
    }
};

export {
    sequelize,
    User,
    SubscriptionPlan,
    Subscription,
    Request,
    File,
    Message,
    Notification,
    Affiliate,
    Referral,
    Testimonial,
    Payment,
    RequestActivity,
    BrandAsset,
    FinancialLog,
    Lead,
    BrandKit,
    SupportMessage
};
