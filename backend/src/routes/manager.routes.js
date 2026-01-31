import express from 'express';
import { body } from 'express-validator';
import {
    getUnassignedRequests,
    assignRequest,
    reassignRequest,
    getDesignerWorkload
} from '../controllers/manager.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isManager } from '../middleware/rbac.middleware.js';

const router = express.Router();

// All routes require manager/admin authentication
router.use(authenticate, isManager);

// Get unassigned requests
router.get('/unassigned', getUnassignedRequests);

// Assign request to designer
router.post('/assign/:id', [
    body('designerId').isUUID().withMessage('Valid designer ID required')
], assignRequest);

// Reassign request to different designer
router.post('/reassign/:id', [
    body('designerId').isUUID().withMessage('Valid designer ID required'),
    body('reason').optional().isString()
], reassignRequest);

// Get designer workload
router.get('/workload', getDesignerWorkload);

export default router;
