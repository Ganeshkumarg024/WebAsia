import { Payment, Subscription, SubscriptionPlan } from '../models/index.js';

export const getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Subscription,
                    as: 'subscription',
                    include: [{ model: SubscriptionPlan, as: 'plan' }]
                }
            ]
        });

        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch payment history'
            }
        });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [
                {
                    model: Subscription,
                    as: 'subscription',
                    include: [{ model: SubscriptionPlan, as: 'plan' }]
                }
            ]
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Payment record not found'
                }
            });
        }

        res.json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Get payment by ID error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch payment details'
            }
        });
    }
};
