import { Affiliate, Referral, User, FinancialLog, Commission, Payout, AffiliateResource } from '../models/index.js';
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
     * Register a user as an affiliate (pending admin approval)
     */
    registerAffiliate: async (userId, applicationNote = null, customRate = null) => {
        // Check if already an affiliate
        const existing = await Affiliate.findOne({ where: { userId } });
        if (existing) {
            if (existing.status === 'rejected') {
                // Allow re-application
                await existing.update({
                    status: 'pending',
                    applicationNote,
                    rejectionReason: null
                });
                return existing;
            }
            return existing;
        }

        const referralCode = await affiliateService.generateReferralCode();

        return await Affiliate.create({
            userId,
            referralCode,
            commissionRate: customRate || 15.00,
            status: 'pending',
            applicationNote
        });
    },

    /**
     * Track a referral click/registration
     */
    assignReferral: async (referredUserId, referralCode, metadata = {}) => {
        if (!referralCode) return null;

        const affiliate = await Affiliate.findOne({ where: { referralCode, status: 'active' } });
        if (!affiliate) return null;

        // Prevent self-referral
        if (affiliate.userId === referredUserId) {
            console.warn('Self-referral attempt blocked:', referralCode);
            return null;
        }

        // Create or update referral record
        const [referral, created] = await Referral.findOrCreate({
            where: { referredUserId },
            defaults: {
                affiliateId: affiliate.id,
                status: 'registered',
                registeredAt: new Date(),
                metadata: {
                    ...metadata,
                    registrationIp: metadata.ip || null,
                    userAgent: metadata.userAgent || null
                }
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

        let commissionAmount;
        if (affiliate.commissionType === 'fixed') {
            commissionAmount = parseFloat(commissionRate);
        } else {
            commissionAmount = (amount * commissionRate) / 100;
        }

        const t = await Referral.sequelize.transaction();

        try {
            // 1. Update Referral
            await referral.update({
                status: 'converted',
                subscriptionId,
                commissionAmount,
                convertedAt: new Date()
            }, { transaction: t });

            // 2. Create Commission Record
            await Commission.create({
                affiliateId: affiliate.id,
                referralId: referral.id,
                paymentId,
                amount: commissionAmount,
                rate: commissionRate,
                type: 'b2c',
                status: 'pending',
                currency,
                paymentAmount: amount
            }, { transaction: t });

            // 3. Update Affiliate Earnings
            await affiliate.increment({
                successfulConversions: 1,
                totalEarnings: commissionAmount,
                pendingEarnings: commissionAmount
            }, { transaction: t });

            // 4. Log Revenue
            await FinancialLog.create({
                type: 'revenue',
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
     * Process recurring commission (for subscription renewals)
     */
    processRecurringCommission: async (userId, subscriptionId, amount, currency, paymentId) => {
        const referral = await Referral.findOne({
            where: { referredUserId: userId, status: 'converted' },
            include: [{ model: Affiliate, as: 'affiliate' }]
        });

        if (!referral || !referral.affiliate || referral.affiliate.status !== 'active') return null;

        const affiliate = referral.affiliate;
        const commissionRate = affiliate.commissionRate;
        let commissionAmount;

        if (affiliate.commissionType === 'fixed') {
            commissionAmount = parseFloat(commissionRate);
        } else {
            commissionAmount = (amount * commissionRate) / 100;
        }

        const t = await Referral.sequelize.transaction();

        try {
            await Commission.create({
                affiliateId: affiliate.id,
                referralId: referral.id,
                paymentId,
                amount: commissionAmount,
                rate: commissionRate,
                type: 'b2c',
                status: 'pending',
                currency,
                paymentAmount: amount
            }, { transaction: t });

            await affiliate.increment({
                totalEarnings: commissionAmount,
                pendingEarnings: commissionAmount
            }, { transaction: t });

            await t.commit();
            return { commissionAmount, affiliateId: affiliate.id };
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
            where: { userId }
        });

        if (!affiliate) throw new Error('Affiliate profile not found');

        return affiliate;
    },

    /**
     * Get affiliate earnings with period filter
     */
    getAffiliateEarnings: async (affiliateId, period = '30d') => {
        const periodMap = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365
        };
        const days = periodMap[period] || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const commissions = await Commission.findAll({
            where: {
                affiliateId,
                createdAt: { [Op.gte]: startDate }
            },
            include: [
                {
                    model: Referral,
                    as: 'referral',
                    include: [{
                        model: User,
                        as: 'referredUser',
                        attributes: ['firstName', 'lastName', 'email']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const totalAmount = commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
        const pendingAmount = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + parseFloat(c.amount), 0);
        const paidAmount = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + parseFloat(c.amount), 0);

        return { commissions, totalAmount, pendingAmount, paidAmount, period };
    },

    /**
     * Get affiliate payout history
     */
    getPayoutHistory: async (affiliateId) => {
        return await Payout.findAll({
            where: { affiliateId },
            order: [['requestedAt', 'DESC']]
        });
    },

    /**
     * Request a payout
     */
    requestPayout: async (affiliateId, amount) => {
        const affiliate = await Affiliate.findByPk(affiliateId);
        if (!affiliate) throw new Error('Affiliate not found');

        if (parseFloat(affiliate.pendingEarnings) < parseFloat(amount)) {
            throw new Error('Insufficient pending earnings');
        }

        if (parseFloat(amount) < 100) {
            throw new Error('Minimum payout amount is ₹100');
        }

        return await Payout.create({
            affiliateId,
            amount,
            status: 'requested',
            payoutMethod: affiliate.payoutMethod,
            payoutDetails: affiliate.payoutDetails,
            requestedAt: new Date()
        });
    },

    /**
     * Update payout settings
     */
    updatePayoutSettings: async (userId, payoutMethod, payoutDetails) => {
        const affiliate = await Affiliate.findOne({ where: { userId } });
        if (!affiliate) throw new Error('Affiliate profile not found');

        await affiliate.update({ payoutMethod, payoutDetails });
        return affiliate;
    },

    /**
     * Get payout settings
     */
    getPayoutSettings: async (userId) => {
        const affiliate = await Affiliate.findOne({
            where: { userId },
            attributes: ['id', 'payoutMethod', 'payoutDetails']
        });
        if (!affiliate) throw new Error('Affiliate profile not found');
        return affiliate;
    },

    /**
     * Get marketing materials for affiliates
     */
    getMarketingMaterials: async (category = null) => {
        const where = { isActive: true };
        if (category) where.category = category;

        return await AffiliateResource.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });
    },

    /**
     * Fraud detection — check for suspicious patterns
     */
    detectFraud: async () => {
        const flags = [];

        // 1. Multiple signups from the same IP
        const referrals = await Referral.findAll({
            where: {
                createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            },
            attributes: ['affiliateId', 'metadata'],
            include: [{
                model: Affiliate,
                as: 'affiliate',
                include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }]
            }]
        });

        // Group by IP and affiliate
        const ipGroups = {};
        referrals.forEach(r => {
            const ip = r.metadata?.registrationIp;
            if (ip) {
                const key = `${r.affiliateId}-${ip}`;
                if (!ipGroups[key]) {
                    ipGroups[key] = { count: 0, affiliateId: r.affiliateId, ip, affiliate: r.affiliate };
                }
                ipGroups[key].count++;
            }
        });

        Object.values(ipGroups).forEach(group => {
            if (group.count >= 3) {
                flags.push({
                    type: 'duplicate_ip',
                    severity: group.count >= 5 ? 'high' : 'medium',
                    affiliateId: group.affiliateId,
                    affiliateName: group.affiliate?.user ? `${group.affiliate.user.firstName} ${group.affiliate.user.lastName}` : 'Unknown',
                    affiliateEmail: group.affiliate?.user?.email || 'Unknown',
                    details: `${group.count} signups from IP ${group.ip}`,
                    ip: group.ip,
                    count: group.count
                });
            }
        });

        // 2. Self-referral attempts (affiliate and referred user share same email domain for company emails)
        const affiliatesWithSelfRisk = await Affiliate.findAll({
            include: [
                { model: User, as: 'user', attributes: ['email', 'firstName', 'lastName'] },
                {
                    model: Referral,
                    as: 'referrals',
                    include: [{ model: User, as: 'referredUser', attributes: ['email'] }]
                }
            ]
        });

        affiliatesWithSelfRisk.forEach(aff => {
            if (!aff.user || !aff.referrals) return;
            const affEmail = aff.user.email;
            aff.referrals.forEach(ref => {
                if (ref.referredUser && ref.referredUser.email === affEmail) {
                    flags.push({
                        type: 'self_referral',
                        severity: 'high',
                        affiliateId: aff.id,
                        affiliateName: `${aff.user.firstName} ${aff.user.lastName}`,
                        affiliateEmail: aff.user.email,
                        details: 'Affiliate attempted to refer themselves',
                        referralId: ref.id
                    });
                }
            });
        });

        return flags;
    }
};
