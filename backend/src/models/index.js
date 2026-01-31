import sequelize from '../config/database.js';
import User from './User.js';
import SubscriptionPlan from './SubscriptionPlan.js';
import Subscription from './Subscription.js';
import Request from './Request.js';
import File from './File.js';
import Message from './Message.js';
import Notification from './Notification.js';

// User associations
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
User.hasMany(Request, { foreignKey: 'clientId', as: 'clientRequests' });
User.hasMany(Request, { foreignKey: 'assignedDesignerId', as: 'designerRequests' });
User.hasMany(Request, { foreignKey: 'assignedManagerId', as: 'managerRequests' });
User.hasMany(File, { foreignKey: 'uploadedBy', as: 'uploadedFiles' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// SubscriptionPlan associations
SubscriptionPlan.hasMany(Subscription, { foreignKey: 'planId', as: 'subscriptions' });

// Subscription associations
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId', as: 'plan' });
Subscription.hasMany(Request, { foreignKey: 'subscriptionId', as: 'requests' });

// Request associations
Request.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
Request.belongsTo(User, { foreignKey: 'assignedDesignerId', as: 'designer' });
Request.belongsTo(User, { foreignKey: 'assignedManagerId', as: 'manager' });
Request.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
Request.hasMany(File, { foreignKey: 'requestId', as: 'files' });
Request.hasMany(Message, { foreignKey: 'requestId', as: 'messages' });

// File associations
File.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });
File.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
File.belongsTo(File, { foreignKey: 'parentFileId', as: 'parentFile' });
File.hasMany(File, { foreignKey: 'parentFileId', as: 'versions' });

// Message associations
Message.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(File, { foreignKey: 'fileId', as: 'file' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

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
    Notification
};
