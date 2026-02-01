import { affiliateService } from '../services/affiliate.service.js';
import { FinancialLog, Referral } from '../models/index.js';
import { validationResult } from 'express-validator';

export const registerAffiliate = async (req, res) => {
    try {
        const affiliate = await affiliateService.registerAffiliate(req.user.id);

        res.status(201).json({
            success: true,
            data: affiliate
        });
    } catch (error) {
        console.error('Register affiliate error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to register as affiliate' }
        });
    }
};

export const getAffiliateStats = async (req, res) => {
    try {
        const stats = await affiliateService.getAffiliateStats(req.user.id);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get affiliate stats error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to get affiliate stats' }
        });
    }
};

export const getReferrals = async (req, res) => {
    try {
        const affiliate = await affiliateService.getAffiliateStats(req.user.id);
        const referrals = await Referral.findAll({
            where: { affiliateId: affiliate.id },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: referrals
        });
    } catch (error) {
        console.error('Get referrals error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to get referrals' }
        });
    }
};

export const requestPayout = async (req, res) => {
    try {
        const { amount, payoutDetails } = req.body;

        const affiliate = await affiliateService.getAffiliateStats(req.user.id);

        if (affiliate.pendingEarnings < amount) {
            return res.status(400).json({
                success: false,
                error: { message: 'Insufficient pending earnings' }
            });
        }

        const t = await FinancialLog.sequelize.transaction();

        try {
            // 1. Create Payout Log (Pending)
            const log = await FinancialLog.create({
                type: 'payout',
                category: 'affiliate_payout',
                amount,
                status: 'pending',
                userId: req.user.id,
                description: `Affiliate payout request for ${req.user.email}`,
                metadata: { payoutDetails }
            }, { transaction: t });

            // 2. Adjust affiliate pending earnings (Temporarily deduct or mark as processing)
            // For now, we'll keep it simple and just create the log. 
            // Admin will deduct it on approval.

            await t.commit();

            res.json({
                success: true,
                message: 'Payout request submitted successfully',
                data: log
            });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Request payout error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to submit payout request' }
        });
    }
};
