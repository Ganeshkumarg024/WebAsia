import express from 'express';
import { body, query } from 'express-validator';
import {
    getMyTasks,
    startTask,
    submitForReview,
    getTaskStats
} from '../controllers/designer.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isDesigner } from '../middleware/rbac.middleware.js';

const router = express.Router();

// All routes require designer authentication
router.use(authenticate, isDesigner);

// Get my assigned tasks
router.get('/tasks', [
    query('status').optional().isString()
], getMyTasks);

// Start working on a task
router.post('/tasks/:id/start', startTask);

// Submit task for review
router.post('/tasks/:id/submit', [
    body('notes').optional().isString()
], submitForReview);

// Get task statistics
router.get('/stats', getTaskStats);

export default router;
