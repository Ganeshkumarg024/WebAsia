import express from 'express';
import { body } from 'express-validator';
import {
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan
} from '../controllers/subscriptionPlan.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/rbac.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllPlans);
router.get('/:id', getPlanById);

// Admin-only routes
router.post('/', authenticate, isAdmin, [
    body('name').trim().notEmpty().withMessage('Plan name is required'),
    body('slug').trim().notEmpty().withMessage('Slug is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('duration').isIn(['weekly', 'monthly', 'quarterly', 'yearly', 'custom']),
    body('activeRequestLimit').isInt({ min: 1 }).withMessage('Active request limit must be at least 1'),
    body('monthlyGraphicsCredits').isInt({ min: 0 }),
    body('monthlyVideoCredits').isInt({ min: 0 }),
    body('monthlyWebCredits').isInt({ min: 0 })
], createPlan);

router.put('/:id', authenticate, isAdmin, updatePlan);
router.delete('/:id', authenticate, isAdmin, deletePlan);

export default router;
