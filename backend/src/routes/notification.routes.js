import express from 'express';
import {
    getMyNotifications,
    markNotificationAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
} from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get my notifications
router.get('/', getMyNotifications);
// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.patch('/:id/read', markNotificationAsRead);

// Mark all as read
router.post('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;
