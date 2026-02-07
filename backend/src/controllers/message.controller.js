import { Message, Request, User, File } from '../models/index.js';
import { Op } from 'sequelize';

export const sendMessage = async (req, res) => {
    try {
        const { requestId, message, messageType = 'text', fileId } = req.body;

        // Verify request exists and user has access
        const request = await Request.findByPk(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'REQUEST_NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        // Check authorization
        const isAuthorized =
            request.clientId === req.user.id ||
            request.assignedDesignerId === req.user.id ||
            request.assignedManagerId === req.user.id ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                }
            });
        }

        // Create message
        const newMessage = await Message.create({
            requestId,
            senderId: req.user.id,
            message,
            messageType,
            fileId: fileId || null
        });

        // Load sender details
        await newMessage.reload({
            include: [
                { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'role', 'photoUrl'] },
                { model: File, as: 'file', attributes: ['id', 'fileName', 'originalName', 'mimeType', 'fileSize'] }
            ]
        });

        // Emit socket event
        const io = req.app.get('io');
        io.to(`request_${requestId}`).emit('message:new', newMessage);

        res.status(201).json({
            success: true,
            data: newMessage
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to send message'
            }
        });
    }
};

export const getRequestMessages = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const messages = await Message.findAll({
            where: { requestId },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'role', 'photoUrl'] },
                { model: File, as: 'file', attributes: ['id', 'fileName', 'originalName', 'mimeType', 'fileSize'] }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch messages'
            }
        });
    }
};

export const markMessagesAsRead = async (req, res) => {
    try {
        const { requestId } = req.params;

        await Message.update(
            {
                isRead: true,
                readAt: new Date()
            },
            {
                where: {
                    requestId,
                    senderId: { [Op.ne]: req.user.id },
                    isRead: false
                }
            }
        );

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Mark messages as read error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to mark messages as read'
            }
        });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const { Op } = await import('sequelize');

        // Get all requests user is involved in
        const userRequests = await Request.findAll({
            where: {
                [Op.or]: [
                    { clientId: req.user.id },
                    { assignedDesignerId: req.user.id },
                    { assignedManagerId: req.user.id }
                ]
            },
            attributes: ['id']
        });

        const requestIds = userRequests.map(r => r.id);

        // Count unread messages
        const unreadCount = await Message.count({
            where: {
                requestId: { [Op.in]: requestIds },
                senderId: { [Op.ne]: req.user.id },
                isRead: false
            }
        });

        res.json({
            success: true,
            data: { unreadCount }
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to get unread count'
            }
        });
    }
};
