import express from 'express';
import * as affiliateController from '../controllers/affiliate.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All affiliate routes require authentication
router.use(authenticate);

// Registration (any user can apply)
router.post('/register', affiliateController.registerAffiliate);

// Dashboard & Stats
router.get('/dashboard', affiliateController.getAffiliateStats);

// Referrals
router.get('/referrals', affiliateController.getReferrals);

// Earnings
router.get('/earnings', affiliateController.getEarnings);

// Referral Link
router.get('/referral-link', affiliateController.getReferralLink);

// Payout Settings
router.get('/settings/payout', affiliateController.getPayoutSettings);
router.put('/settings/payout', affiliateController.updatePayoutSettings);

// Payouts
router.post('/payout-request', affiliateController.requestPayout);
router.get('/payouts', affiliateController.getPayouts);

// Marketing Materials
router.get('/marketing-materials', affiliateController.getMarketingMaterials);

export default router;
