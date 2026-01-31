import express from 'express';
import { body } from 'express-validator';
import {
    sendMessage,
    getRequestMessages,
    markMessagesAsRead,
    getUnreadCount
} from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Send message
router.post('/', [
    body('requestId').isUUID().withMessage('Valid request ID required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('messageType').optional().isIn(['text', 'file', 'system']),
    body('fileId').optional().isUUID()
], sendMessage);

// Get messages for a request
router.get('/request/:requestId', getRequestMessages);

// Mark messages as read
router.post('/request/:requestId/read', markMessagesAsRead);

// Get unread count
router.get('/unread-count', getUnreadCount);

export default router;
