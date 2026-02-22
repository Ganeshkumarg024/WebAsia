import { affiliateService } from '../services/affiliate.service.js';
import { Affiliate, Referral, Commission, Payout, User } from '../models/index.js';

/**
 * Helper: Get affiliate record for current user, auto-create if missing
 */
const getOrCreateAffiliate = async (userId) => {
    let affiliate = await Affiliate.findOne({ where: { userId } });
    if (!affiliate) {
        const user = await User.findByPk(userId);
        if (user && user.role === 'affiliate') {
            affiliate = await affiliateService.registerAffiliate(userId);
            await affiliate.update({
                status: 'active',
                approvedAt: new Date()
            });
            affiliate = await Affiliate.findOne({ where: { userId } });
        }
    }
    return affiliate;
};

// Register as affiliate (pending approval)
export const registerAffiliate = async (req, res) => {
    try {
        const { applicationNote } = req.body;
        const affiliate = await affiliateService.registerAffiliate(req.user.id, applicationNote);

        res.status(201).json({
            success: true,
            data: affiliate,
            message: affiliate.status === 'pending'
                ? 'Application submitted! You will be notified once approved.'
                : 'You are already registered as an affiliate.'
        });
    } catch (error) {
        console.error('Register affiliate error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to register as affiliate' }
        });
    }
};

// Get affiliate dashboard stats
export const getAffiliateStats = async (req, res) => {
    try {
        const affiliate = await getOrCreateAffiliate(req.user.id);

        if (!affiliate) {
            return res.json({
                success: true,
                data: {
                    status: 'none',
                    totalEarnings: 0,
                    pendingEarnings: 0,
                    paidEarnings: 0,
                    totalReferrals: 0,
                    successfulConversions: 0,
                    activeReferrals: 0,
                    conversionRate: 0,
                    commissionRate: 15,
                    commissionType: 'percentage',
                    tier: 'standard',
                    referralCode: null,
                    referrals: []
                }
            });
        }

        let recentReferrals = [];
        try {
            recentReferrals = await Referral.findAll({
                where: { affiliateId: affiliate.id },
                include: [{
                    model: User,
                    as: 'referredUser',
                    attributes: ['firstName', 'lastName', 'email'],
                    required: false
                }],
                order: [['createdAt', 'DESC']],
                limit: 10
            });
        } catch (refErr) {
            console.error('Error fetching referrals for dashboard:', refErr.message);
        }

        let activeReferrals = 0;
        try {
            activeReferrals = await Referral.count({
                where: {
                    affiliateId: affiliate.id,
                    status: 'converted'
                }
            });
        } catch (countErr) {
            console.error('Error counting active referrals:', countErr.message);
        }

        const affiliateData = affiliate.toJSON();

        res.json({
            success: true,
            data: {
                ...affiliateData,
                referrals: recentReferrals,
                activeReferrals,
                conversionRate: affiliate.totalReferrals > 0
                    ? ((affiliate.successfulConversions / affiliate.totalReferrals) * 100).toFixed(1)
                    : 0
            }
        });
    } catch (error) {
        console.error('Get affiliate stats error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to get affiliate stats' }
        });
    }
};

// Get referrals list
export const getReferrals = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const affiliate = await getOrCreateAffiliate(req.user.id);
        if (!affiliate) {
            return res.json({
                success: true,
                data: [],
                pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
            });
        }

        const where = { affiliateId: affiliate.id };
        if (status && status !== 'all') where.status = status;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { rows: referrals, count: total } = await Referral.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'referredUser',
                attributes: ['firstName', 'lastName', 'email', 'createdAt'],
                required: false
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            data: referrals,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get referrals error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to get referrals' }
        });
    }
};

// Get earnings / commission history
export const getEarnings = async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        const affiliate = await getOrCreateAffiliate(req.user.id);
        if (!affiliate) {
            return res.json({
                success: true,
                data: { commissions: [], totalAmount: 0, pendingAmount: 0, paidAmount: 0, period }
            });
        }

        const earnings = await affiliateService.getAffiliateEarnings(affiliate.id, period);

        res.json({
            success: true,
            data: earnings
        });
    } catch (error) {
        console.error('Get earnings error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to get earnings' }
        });
    }
};

// Get referral link
export const getReferralLink = async (req, res) => {
    try {
        const affiliate = await getOrCreateAffiliate(req.user.id);
        if (!affiliate) {
            return res.json({
                success: true,
                data: {
                    referralCode: null,
                    referralLink: null,
                    status: 'none'
                }
            });
        }

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        res.json({
            success: true,
            data: {
                referralCode: affiliate.referralCode,
                referralLink: `${baseUrl}?ref=${affiliate.referralCode}`,
                status: affiliate.status
            }
        });
    } catch (error) {
        console.error('Get referral link error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to get referral link' }
        });
    }
};

// Get payout settings
export const getPayoutSettings = async (req, res) => {
    try {
        const affiliate = await getOrCreateAffiliate(req.user.id);

        if (!affiliate) {
            return res.json({
                success: true,
                data: { payoutMethod: null, payoutDetails: null }
            });
        }

        res.json({
            success: true, data: {
                id: affiliate.id,
                payoutMethod: affiliate.payoutMethod,
                payoutDetails: affiliate.payoutDetails
            }
        });
    } catch (error) {
        console.error('Get payout settings error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to get payout settings' }
        });
    }
};

// Update payout settings
export const updatePayoutSettings = async (req, res) => {
    try {
        const { paymentMethod, bankDetails, upiId, paypalEmail } = req.body;

        let payoutMethod = 'bank_transfer';
        let payoutDetails = {};

        if (paymentMethod === 'upi') {
            payoutMethod = 'upi';
            payoutDetails = { upiId };
        } else if (paymentMethod === 'paypal') {
            payoutMethod = 'paypal';
            payoutDetails = { paypalEmail };
        } else {
            payoutMethod = 'bank_transfer';
            payoutDetails = bankDetails || {};
        }

        const affiliate = await affiliateService.updatePayoutSettings(req.user.id, payoutMethod, payoutDetails);

        res.json({
            success: true,
            message: 'Payout settings updated successfully',
            data: affiliate
        });
    } catch (error) {
        console.error('Update payout settings error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to update payout settings' }
        });
    }
};

// Request payout
export const requestPayout = async (req, res) => {
    try {
        const { amount } = req.body;
        const affiliate = await getOrCreateAffiliate(req.user.id);
        if (!affiliate) {
            return res.status(404).json({ success: false, error: { message: 'Affiliate profile not found' } });
        }

        if (!affiliate.payoutMethod || !affiliate.payoutDetails) {
            return res.status(400).json({
                success: false,
                error: { message: 'Please set up your payout details first' }
            });
        }

        const payout = await affiliateService.requestPayout(affiliate.id, amount);

        res.json({
            success: true,
            message: 'Payout request submitted successfully',
            data: payout
        });
    } catch (error) {
        console.error('Request payout error:', error);
        res.status(400).json({
            success: false,
            error: { message: error.message || 'Failed to submit payout request' }
        });
    }
};

// Get payout history
export const getPayouts = async (req, res) => {
    try {
        const affiliate = await getOrCreateAffiliate(req.user.id);
        if (!affiliate) {
            return res.json({ success: true, data: [] });
        }

        const payouts = await affiliateService.getPayoutHistory(affiliate.id);

        res.json({
            success: true,
            data: payouts
        });
    } catch (error) {
        console.error('Get payouts error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to get payout history' }
        });
    }
};

// Get marketing materials
export const getMarketingMaterials = async (req, res) => {
    try {
        const { category } = req.query;
        const materials = await affiliateService.getMarketingMaterials(category);

        res.json({
            success: true,
            data: materials
        });
    } catch (error) {
        console.error('Get marketing materials error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to get marketing materials' }
        });
    }
};
