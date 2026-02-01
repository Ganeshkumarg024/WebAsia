import { Subscription, SubscriptionPlan, User } from '../models/index.js';
import { Op } from 'sequelize';
import { paymentService } from '../services/payment.service.js';

export const getUserSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            where: {
                userId: req.user.id,
                status: { [Op.in]: ['active', 'past_due'] }
            },
            include: [
                {
                    model: SubscriptionPlan,
                    as: 'plan'
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch subscription'
            }
        });
    }
};

export const createSubscription = async (req, res) => {
    try {
        const { planId, paymentId, paymentMethod, amount, currency } = req.body;

        const result = await paymentService.handleSuccessfulPayment({
            userId: req.user.id,
            planId,
            amount: amount || 0,
            currency: currency || 'INR',
            gateway: 'manual', // or appropriate gateway
            gatewayPaymentId: paymentId,
            paymentMethod: paymentMethod || 'offline',
            metadata: { source: 'manual_creation' }
        });

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: result.subscription
        });
    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: error.message || 'Failed to create subscription'
            }
        });
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const result = await paymentService.handleSubscriptionCancellation(null, req.body.paymentId);

        if (!result) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Active subscription not found'
                }
            });
        }

        res.json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: result
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to cancel subscription'
            }
        });
    }
};

export const updateSubscriptionPlan = async (req, res) => {
    try {
        const { newPlanId } = req.body;

        const subscription = await paymentService.handlePlanChange(req.user.id, newPlanId);

        res.json({
            success: true,
            message: 'Subscription plan updated successfully',
            data: subscription
        });
    } catch (error) {
        console.error('Update subscription plan error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: error.message || 'Failed to update subscription plan'
            }
        });
    }
};

export const deductCredits = async (subscriptionId, serviceType, amount = 1) => {
    try {
        const subscription = await Subscription.findByPk(subscriptionId);

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const creditField = {
            'graphic_design': 'graphicsCreditsRemaining',
            'video_production': 'videoCreditsRemaining',
            'web_development': 'webCreditsRemaining'
        }[serviceType];

        if (!creditField) {
            throw new Error('Invalid service type');
        }

        const currentCredits = subscription[creditField];
        if (currentCredits < amount) {
            throw new Error('Insufficient credits');
        }

        await subscription.update({
            [creditField]: currentCredits - amount
        });

        return subscription;
    } catch (error) {
        throw error;
    }
};
