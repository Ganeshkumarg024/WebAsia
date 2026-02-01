import express from 'express';
import * as testimonialController from '../controllers/testimonial.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

// Public route for landing page
router.get('/public', testimonialController.getPublicTestimonials);

// Protected routes
router.use(authenticate);

router.post('/submit', [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('title').optional().trim(),
    body('requestId').optional().isUUID(),
], testimonialController.submitTestimonial);

router.get('/my', testimonialController.getMyTestimonials);

export default router;
