import express from 'express';
import {
    getDashboardStats,
    getDeliveries,
    getMyTestimonials,
    getSubscriptionDetails
} from '../controllers/client.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isClient, isClientOrAdmin } from '../middleware/rbac.middleware.js';

const router = express.Router();

// All routes require authentication and client role
router.use(authenticate);
router.use(isClient);

// Dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// Deliveries
router.get('/deliveries', getDeliveries);

// Testimonials
router.get('/testimonials', getMyTestimonials);

// Subscription details
router.get('/subscription', getSubscriptionDetails);

export default router;
