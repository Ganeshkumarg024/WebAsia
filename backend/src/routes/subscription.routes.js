import express from 'express';
import { body } from 'express-validator';
import {
    getUserSubscription,
    createSubscription,
    cancelSubscription,
    updateSubscriptionPlan
} from '../controllers/subscription.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user's current subscription
router.get('/me', getUserSubscription);

// Create new subscription
router.post('/', [
    body('planId').isUUID().withMessage('Valid plan ID is required'),
    body('paymentId').notEmpty().withMessage('Payment ID is required'),
    body('paymentMethod').isIn(['razorpay', 'stripe']).withMessage('Invalid payment method')
], createSubscription);

// Cancel subscription
router.post('/cancel', [
    body('reason').optional().isString()
], cancelSubscription);

// Upgrade/downgrade subscription
router.put('/change-plan', [
    body('newPlanId').isUUID().withMessage('Valid plan ID is required')
], updateSubscriptionPlan);

export default router;
