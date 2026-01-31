import express from 'express';
import { body, query } from 'express-validator';
import {
    createRequest,
    getMyRequests,
    getRequestById,
    updateRequestStatus,
    cancelRequest
} from '../controllers/request.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isClient, isClientOrAdmin } from '../middleware/rbac.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create new request (client only)
router.post('/', isClient, [
    body('serviceType')
        .isIn(['graphic_design', 'video_production', 'social_media', 'web_development', 'branding'])
        .withMessage('Invalid service type'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('specifications').optional().isObject(),
    body('priority').optional().isIn(['normal', 'urgent'])
], createRequest);

// Get my requests
router.get('/my-requests', isClientOrAdmin, [
    query('status').optional().isString(),
    query('serviceType').optional().isString()
], getMyRequests);

// Get request by ID
router.get('/:id', getRequestById);

// Update request status
router.patch('/:id/status', [
    body('status')
        .isIn(['queued', 'active', 'assigned', 'in_progress', 'pending_review', 'client_review', 'revision_requested', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
    body('feedback').optional().isString()
], updateRequestStatus);

// Cancel request (client only)
router.post('/:id/cancel', isClient, [
    body('reason').optional().isString()
], cancelRequest);

export default router;
