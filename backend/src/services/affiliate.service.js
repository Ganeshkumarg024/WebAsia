import { Affiliate, Referral, User, FinancialLog } from '../models/index.js';
import { Op } from 'sequelize';
import crypto from 'crypto';

export const affiliateService = {
    /**
     * Generate a unique referral code
     */
    generateReferralCode: async (prefix = 'WA') => {
        let isUnique = false;
        let referralCode = '';

        while (!isUnique) {
            const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
            referralCode = `${prefix}-${randomStr}`;

            const existing = await Affiliate.findOne({ where: { referralCode } });
            if (!existing) isUnique = true;
        }

        return referralCode;
    },

    /**
     * Register a user as an affiliate
     */
    registerAffiliate: async (userId, customRate = null) => {
        // Check if already an affiliate
        const existing = await Affiliate.findOne({ where: { userId } });
        if (existing) return existing;

        const referralCode = await affiliateService.generateReferralCode();

        return await Affiliate.create({
            userId,
            referralCode,
            commissionRate: customRate || 15.00,
            status: 'active'
        });
    },

    /**
     * Track a referral registration
     */
    assignReferral: async (referredUserId, referralCode) => {
        if (!referralCode) return null;

        const affiliate = await Affiliate.findOne({ where: { referralCode, status: 'active' } });
        if (!affiliate) return null;

        // Create or update referral record
        const [referral, created] = await Referral.findOrCreate({
            where: { referredUserId },
            defaults: {
                affiliateId: affiliate.id,
                status: 'registered',
                registeredAt: new Date()
            }
        });

        if (!created && referral.status === 'clicked') {
            await referral.update({
                referredUserId,
                status: 'registered',
                registeredAt: new Date()
            });
        }

        // Increment total referrals
        await affiliate.increment('totalReferrals');

        return referral;
    },

    /**
     * Process referral commission on successful payment
     */
    processReferralConversion: async (userId, subscriptionId, amount, currency, paymentId) => {
        const referral = await Referral.findOne({
            where: { referredUserId: userId, status: { [Op.in]: ['registered', 'subscribed'] } },
            include: [{ model: Affiliate, as: 'affiliate' }]
        });

        if (!referral || !referral.affiliate) return null;

        const affiliate = referral.affiliate;
        const commissionRate = affiliate.commissionRate;
        const commissionAmount = (amount * commissionRate) / 100;

        const t = await Referral.sequelize.transaction();

        try {
            // 1. Update Referral
            await referral.update({
                status: 'converted',
                subscriptionId,
                commissionAmount,
                convertedAt: new Date()
            }, { transaction: t });

            // 2. Update Affiliate Earnings
            await affiliate.increment({
                successfulConversions: 1,
                totalEarnings: commissionAmount,
                pendingEarnings: commissionAmount
            }, { transaction: t });

            // 3. Log Revenue (Commission) - This is an internal expense/log
            await FinancialLog.create({
                type: 'revenue', // Or 'expense' depending on perspective. Platform revenue is reduced by commission.
                category: 'affiliate_commission',
                amount: commissionAmount,
                currency,
                status: 'pending',
                userId: affiliate.userId,
                paymentId,
                relatedId: referral.id,
                description: `Affiliate commission for referral conversion (User ID: ${userId})`
            }, { transaction: t });

            await t.commit();
            return referral;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    /**
     * Get Affiliate Stats
     */
    getAffiliateStats: async (userId) => {
        const affiliate = await Affiliate.findOne({
            where: { userId },
            include: [{
                model: Referral,
                as: 'referrals',
                attributes: ['status', 'createdAt', 'commissionAmount', 'convertedAt'],
                limit: 10,
                order: [['createdAt', 'DESC']]
            }]
        });

        if (!affiliate) throw new Error('Affiliate profile not found');

        return affiliate;
    }
};
