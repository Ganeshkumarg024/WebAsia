import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    sendSupportMessage,
    getSupportMessages,
    getSupportConversations,
    markSupportMessagesAsRead,
    getUnreadSupportCount
} from '../controllers/supportChat.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Send a support message
router.post('/messages', sendSupportMessage);

// Get support messages for current user
router.get('/messages', getSupportMessages);

// Get all support conversations (admin only)
router.get('/conversations', getSupportConversations);

// Mark messages as read
router.put('/messages/:clientId/read', markSupportMessagesAsRead);

// Get unread count
router.get('/unread-count', getUnreadSupportCount);

export default router;
