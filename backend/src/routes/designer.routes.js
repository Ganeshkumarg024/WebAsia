import express from 'express';
import { body, query } from 'express-validator';
import {
    getMyTasks,
    startTask,
    submitForReview,
    getTaskStats,
    getDashboardStats,
    getTaskById,
    updateTaskStatus,
    getAnalytics
} from '../controllers/designer.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isDesigner } from '../middleware/rbac.middleware.js';

const router = express.Router();

// All routes require designer authentication
router.use(authenticate, isDesigner);

// Get dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// Get analytics
router.get('/analytics', [
    query('period').optional().isIn(['week', 'month', 'year'])
], getAnalytics);

// Get task statistics
router.get('/stats', getTaskStats);

// Get my assigned tasks
router.get('/tasks', [
    query('status').optional().isString(),
    query('priority').optional().isString(),
    query('serviceType').optional().isString(),
    query('page').optional().isInt(),
    query('limit').optional().isInt()
], getMyTasks);

// Get task by ID
router.get('/tasks/:id', getTaskById);

// Start working on a task
router.post('/tasks/:id/start', startTask);

// Submit task for review
router.post('/tasks/:id/submit', [
    body('notes').optional().isString()
], submitForReview);

// Update task status
router.patch('/tasks/:id/status', [
    body('status').isString().notEmpty(),
    body('notes').optional().isString()
], updateTaskStatus);

export default router;
