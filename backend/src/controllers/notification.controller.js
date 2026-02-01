import { Notification, User } from '../models/index.js';
import { Op } from 'sequelize';

export const createNotification = async (userId, type, title, message, relatedId = null, relatedType = null, actionUrl = null) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            relatedId,
            relatedType,
            actionUrl
        });

        // Emit socket event
        // This will be called from socket.js
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        throw error;
    }
};

export const getMyNotifications = async (req, res) => {
    try {
        const { limit = 20, offset = 0, unreadOnly = false } = req.query;

        const where = { userId: req.user.id };
        if (unreadOnly === 'true') {
            where.isRead = false;
        }

        const notifications = await Notification.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const unreadCount = await Notification.count({
            where: {
                userId: req.user.id,
                isRead: false
            }
        });

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch notifications'
            }
        });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.count({
            where: {
                userId: req.user.id,
                isRead: false
            }
        });

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch unread count'
            }
        });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            where: {
                id,
                userId: req.user.id
            }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Notification not found'
                }
            });
        }

        await notification.update({
            isRead: true,
            readAt: new Date()
        });

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to mark notification as read'
            }
        });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            {
                isRead: true,
                readAt: new Date()
            },
            {
                where: {
                    userId: req.user.id,
                    isRead: false
                }
            }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to mark notifications as read'
            }
        });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            where: {
                id,
                userId: req.user.id
            }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Notification not found'
                }
            });
        }

        await notification.destroy();

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to delete notification'
            }
        });
    }
};

// Helper function to send notifications
export const notifyUser = async (userId, type, title, message, relatedId, relatedType, actionUrl, io) => {
    try {
        const notification = await createNotification(
            userId,
            type,
            title,
            message,
            relatedId,
            relatedType,
            actionUrl
        );

        // Emit socket event
        if (io) {
            io.to(`user_${userId}`).emit('new_notification', notification);
        }

        return notification;
    } catch (error) {
        console.error('Notify user error:', error);
    }
};
