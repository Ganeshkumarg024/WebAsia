import express from 'express';
import { body, query } from 'express-validator';
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getDashboardStats,
    getAnalytics,
    getPods,
    assignToPod,
    removeFromPod,
    getCommThreads,
    getCommThreadDetails,
    flagCommThread,
    getFinancialStats,
    getTransactions,
    getAdminRequests,
    bulkUpdateRequests,
    getUnassignedDesigners,
    getRefundRequests,
    handleRefund,
    getTestimonials,
    approveTestimonial,
    rejectTestimonial,
    getAllAffiliates,
    updateAffiliateCommission,
    approvePayout
} from '../controllers/admin.controller.js';
import {
    getAllRequests,
    getRequestDetails,
    updateRequestStatus,
    assignDesigner,
    assignManager,
    addRequestNote,
    getAvailableDesigners,
    getAvailableManagers,
    getRequestTimeline
} from '../controllers/adminRequest.controller.js';
import { getAllPlans } from '../controllers/subscriptionPlan.controller.js';
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

// Pod Management
router.get('/pods', getPods);
router.get('/team-mapping', getPods); // Re-using getPods for team mapping view
router.get('/designers/unassigned', getUnassignedDesigners);
router.post('/pods/assign', [
    body('podId').isUUID().withMessage('Valid pod ID required'),
    body('designerId').isUUID().withMessage('Valid designer ID required')
], assignToPod);
router.delete('/pods/:podId/member/:userId', removeFromPod);

// Communication Hub
router.get('/comm/threads', getCommThreads);
router.get('/comm/threads/:id', getCommThreadDetails);
router.post('/comm/threads/:id/flag', [
    body('reason').notEmpty().withMessage('Reason required')
], flagCommThread);

// Financials
router.get('/financials/stats', getFinancialStats);
router.get('/financials/transactions', getTransactions);
router.get('/financials/refunds', getRefundRequests);
router.post('/financials/refunds/:id', [
    body('action').isIn(['approve', 'reject']).withMessage('Invalid action')
], handleRefund);

// Global Request Management
router.get('/requests', getAllRequests);
router.get('/requests/:id', getRequestDetails);
router.put('/requests/:id/status', [
    body('status').isIn(['queued', 'active', 'assigned', 'in_progress', 'review', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('note').optional().isString()
], updateRequestStatus);
router.put('/requests/:id/assign-designer', [
    body('designerId').isUUID().withMessage('Valid designer ID required')
], assignDesigner);
router.put('/requests/:id/assign-manager', [
    body('managerId').isUUID().withMessage('Valid manager ID required')
], assignManager);
router.post('/requests/:id/notes', [
    body('note').notEmpty().withMessage('Note cannot be empty'),
    body('isInternal').optional().isBoolean()
], addRequestNote);
router.get('/requests/:id/timeline', getRequestTimeline);

// Get available designers and managers
router.get('/designers/available', getAvailableDesigners);
router.get('/managers/available', getAvailableManagers);

// Legacy bulk update route (keeping for backwards compatibility)
router.patch('/requests/bulk', [
    body('requestIds').isArray().withMessage('Request IDs must be an array'),
], bulkUpdateRequests);

// Testimonials
router.get('/testimonials', getTestimonials);
router.post('/testimonials/:id/approve', approveTestimonial);
router.post('/testimonials/:id/reject', rejectTestimonial);

// Affiliate Management
router.get('/affiliates', getAllAffiliates);
router.patch('/affiliates/:id/commission', updateAffiliateCommission);
router.post('/affiliates/payouts/:id/approve', approvePayout);

// Affiliate Management
router.get('/affiliates', getAllAffiliates);
router.patch('/affiliates/:id/commission', updateAffiliateCommission);
router.post('/affiliates/payouts/:id/approve', approvePayout);

// Plans Management
router.get('/plans', getAllPlans);

// Lead Management
import {
    getAllLeads,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    createQuote
} from '../controllers/lead.controller.js';

router.get('/leads', getAllLeads);
router.post('/leads', [
    body('company').notEmpty().withMessage('Company name required'),
    body('contactName').notEmpty().withMessage('Contact name required'),
    body('email').isEmail().withMessage('Valid email required')
], createLead);
router.put('/leads/:id', updateLead);
router.delete('/leads/:id', deleteLead);
router.patch('/leads/:id/status', updateLeadStatus);
router.post('/leads/:id/quote', [
    body('amount').isNumeric().withMessage('Valid amount required'),
    body('notes').notEmpty().withMessage('Notes required')
], createQuote);

export default router;
