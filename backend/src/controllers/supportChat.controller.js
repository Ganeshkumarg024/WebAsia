import { SupportMessage, User } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

// Send a support message
export const sendSupportMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_MESSAGE',
                    message: 'Message cannot be empty'
                }
            });
        }

        // Determine sender type and IDs based on role
        let clientId, adminId, senderType;

        if (userRole === 'client') {
            clientId = userId;
            adminId = null;
            senderType = 'client';
        } else if (userRole === 'admin') {
            // For admin replies, we need the clientId from request body
            const { clientId: targetClientId } = req.body;
            if (!targetClientId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'CLIENT_ID_REQUIRED',
                        message: 'Client ID is required for admin messages'
                    }
                });
            }
            clientId = targetClientId;
            adminId = userId;
            senderType = 'admin';
        } else {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Only clients and admins can use support chat'
                }
            });
        }

        // Create support message
        const supportMessage = await SupportMessage.create({
            clientId,
            adminId,
            message: message.trim(),
            senderType
        });

        // Load with user details
        await supportMessage.reload({
            include: [
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email', 'photoUrl'] },
                { model: User, as: 'admin', attributes: ['id', 'firstName', 'lastName', 'email', 'photoUrl'] }
            ]
        });

        // Emit socket event if available
        const io = req.app.get('io');
        if (io) {
            io.to(`support_${clientId}`).emit('support:message', supportMessage);
            io.to('admin_support').emit('support:message', supportMessage);
        }

        res.status(201).json({
            success: true,
            data: supportMessage
        });
    } catch (error) {
        console.error('Send support message error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to send support message'
            }
        });
    }
};

// Get support messages for current user
export const getSupportMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { limit = 100, offset = 0 } = req.query;

        let whereClause = {};

        if (userRole === 'client') {
            // Clients can only see their own messages
            whereClause.clientId = userId;
        } else if (userRole === 'admin') {
            // Admins can see all messages (handled by no where clause restriction)
            // Or optionally filter by specific client if provided
            const { clientId } = req.query;
            if (clientId) {
                whereClause.clientId = clientId;
            }
        } else {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                }
            });
        }

        const messages = await SupportMessage.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email', 'photoUrl'] },
                { model: User, as: 'admin', attributes: ['id', 'firstName', 'lastName', 'email', 'photoUrl'] }
            ],
            order: [['created_at', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Get support messages error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch support messages'
            }
        });
    }
};

// Get all support conversations (admin only)
export const getSupportConversations = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Admin access required'
                }
            });
        }

        // Get unique client IDs with their latest message
        const conversations = await SupportMessage.findAll({
            attributes: [
                'clientId',
                [sequelize.fn('MAX', sequelize.col('SupportMessage.created_at')), 'lastMessageAt'],
                [sequelize.fn('COUNT', sequelize.col('SupportMessage.id')), 'messageCount'],
                [sequelize.fn('SUM', sequelize.literal('CASE WHEN "SupportMessage"."is_read" = false AND "SupportMessage"."sender_type" = \'client\' THEN 1 ELSE 0 END')), 'unreadCount']
            ],
            include: [
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email', 'photoUrl'] }
            ],
            group: ['SupportMessage.client_id', 'client.id'],
            order: [[sequelize.fn('MAX', sequelize.col('SupportMessage.created_at')), 'DESC']]
        });

        res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error('Get support conversations error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch support conversations'
            }
        });
    }
};

// Mark messages as read
export const markSupportMessagesAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { clientId } = req.params;

        let whereClause = { isRead: false };

        if (userRole === 'client') {
            // Clients mark admin messages as read
            whereClause.clientId = userId;
            whereClause.senderType = 'admin';
        } else if (userRole === 'admin') {
            // Admins mark client messages as read
            whereClause.clientId = clientId;
            whereClause.senderType = 'client';
        } else {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                }
            });
        }

        const [updatedCount] = await SupportMessage.update(
            { isRead: true },
            { where: whereClause }
        );

        res.json({
            success: true,
            data: { updatedCount }
        });
    } catch (error) {
        console.error('Mark support messages as read error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to mark messages as read'
            }
        });
    }
};

// Get unread support message count
export const getUnreadSupportCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let whereClause = { isRead: false };

        if (userRole === 'client') {
            // Count unread admin messages
            whereClause.clientId = userId;
            whereClause.senderType = 'admin';
        } else if (userRole === 'admin') {
            // Count all unread client messages
            whereClause.senderType = 'client';
        } else {
            return res.json({
                success: true,
                data: { unreadCount: 0 }
            });
        }

        const unreadCount = await SupportMessage.count({ where: whereClause });

        res.json({
            success: true,
            data: { unreadCount }
        });
    } catch (error) {
        console.error('Get unread support count error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to get unread count'
            }
        });
    }
};
