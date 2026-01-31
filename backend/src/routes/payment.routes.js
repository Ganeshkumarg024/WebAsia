import express from 'express';
import { body } from 'express-validator';
import {
    createRazorpayOrder,
    verifyRazorpayPayment,
    handleRazorpayWebhook
} from '../controllers/payment.razorpay.controller.js';
import {
    createStripeCheckoutSession,
    getStripeSession,
    cancelStripeSubscription,
    handleStripeWebhook
} from '../controllers/payment.stripe.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Razorpay routes
router.post('/razorpay/create-order', authenticate, [
    body('planId').isUUID(),
    body('amount').isNumeric(),
    body('currency').optional().isString()
], createRazorpayOrder);

router.post('/razorpay/verify', authenticate, [
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty()
], verifyRazorpayPayment);

router.post('/razorpay/webhook', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

// Stripe routes
router.post('/stripe/create-checkout', authenticate, [
    body('planId').isUUID(),
    body('planName').notEmpty(),
    body('amount').isNumeric(),
    body('currency').optional().isString()
], createStripeCheckoutSession);

router.get('/stripe/session/:sessionId', authenticate, getStripeSession);

router.post('/stripe/cancel-subscription', authenticate, [
    body('subscriptionId').notEmpty()
], cancelStripeSubscription);

router.post('/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
