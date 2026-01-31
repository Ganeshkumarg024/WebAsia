import express from 'express';
import { body, query } from 'express-validator';
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getDashboardStats,
    getAnalytics
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/rbac.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, isAdmin);

// User management
router.get('/users', [
    query('role').optional().isString(),
    query('status').optional().isString(),
    query('search').optional().isString(),
    query('limit').optional().isInt(),
    query('offset').optional().isInt()
], getAllUsers);

router.post('/users', [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
    body('role').isIn(['client', 'designer', 'manager', 'admin', 'affiliate']).withMessage('Valid role required'),
    body('phone').optional().isString()
], createUser);

router.put('/users/:id', updateUser);

router.delete('/users/:id', deleteUser);

// Dashboard & Analytics
router.get('/dashboard/stats', getDashboardStats);

router.get('/analytics', [
    query('period').optional().isIn(['7d', '30d', '90d', '1y'])
], getAnalytics);

export default router;
