import express from 'express';
import * as affiliateController from '../controllers/affiliate.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All affiliate routes require authentication
router.use(authenticate);

// Registration
router.post('/register', affiliateController.registerAffiliate);

// Stats & Referrals
router.get('/dashboard', affiliateController.getAffiliateStats);
router.get('/referrals', affiliateController.getReferrals);

// Payouts
router.post('/payout-request', affiliateController.requestPayout);

export default router;
