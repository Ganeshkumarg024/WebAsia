import { Subscription, SubscriptionPlan, User } from '../models/index.js';
import { Op } from 'sequelize';
import { paymentService } from '../services/payment.service.js';
import { subscriptionService } from '../services/subscription.service.js';

export const getUserSubscription = async (req, res) => {
    try {
        // Run expiry check
        await subscriptionService.checkSubscriptionStatus(req.user.id);

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
            order: [['created_at', 'DESC']]
        });

        if (!subscription) {
            return res.json({
                success: true,
                data: null
            });
        }

        // Calculate credits with accurate breakdown
        const plan = subscription.plan;

        const totalCredits =
            (plan.monthlyGraphicsCredits || 0) +
            (plan.monthlyVideoCredits || 0) +
            (plan.monthlyWebCredits || 0);

        const graphicsUsed = (plan.monthlyGraphicsCredits || 0) - (subscription.graphicsCreditsRemaining || 0);
        const videoUsed = (plan.monthlyVideoCredits || 0) - (subscription.videoCreditsRemaining || 0);
        const webUsed = (plan.monthlyWebCredits || 0) - (subscription.webCreditsRemaining || 0);

        const usedCredits = graphicsUsed + videoUsed + webUsed;
        const remainingCredits = totalCredits - usedCredits;

        // Add credits object to response
        const subscriptionData = subscription.toJSON();
        subscriptionData.credits = {
            total: totalCredits,
            used: usedCredits,
            remaining: remainingCredits,
            breakdown: {
                graphics: {
                    total: plan.monthlyGraphicsCredits || 0,
                    used: graphicsUsed,
                    remaining: subscription.graphicsCreditsRemaining || 0
                },
                video: {
                    total: plan.monthlyVideoCredits || 0,
                    used: videoUsed,
                    remaining: subscription.videoCreditsRemaining || 0
                },
                web: {
                    total: plan.monthlyWebCredits || 0,
                    used: webUsed,
                    remaining: subscription.webCreditsRemaining || 0
                }
            },
            resetDate: subscription.creditsResetDate
        };

        res.json({
            success: true,
            data: subscriptionData
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
        const { planId, paymentId, paymentMethod, amount, currency, gateway = 'razorpay' } = req.body;

        // Basic validation
        if (req.user.role !== 'client') {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Only clients can create subscriptions' }
            });
        }

        const result = await paymentService.handleSuccessfulPayment({
            userId: req.user.id,
            planId,
            amount: amount || 0,
            currency: currency || 'INR',
            gateway,
            gatewayPaymentId: paymentId,
            paymentMethod: paymentMethod || 'online',
            metadata: { source: 'checkout_flow' }
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

        if (subscription.status !== 'active') {
            throw new Error('Subscription is not active');
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

export const refundCredits = async (subscriptionId, serviceType, amount = 1) => {
    try {
        const subscription = await Subscription.findByPk(subscriptionId, {
            include: [{ model: SubscriptionPlan, as: 'plan' }]
        });

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const creditField = {
            'graphic_design': 'graphicsCreditsRemaining',
            'video_production': 'videoCreditsRemaining',
            'web_development': 'webCreditsRemaining'
        }[serviceType];

        const planField = {
            'graphic_design': 'monthlyGraphicsCredits',
            'video_production': 'monthlyVideoCredits',
            'web_development': 'monthlyWebCredits'
        }[serviceType];

        if (!creditField || !planField) {
            throw new Error('Invalid service type for refund');
        }

        const currentCredits = subscription[creditField];
        const maxCredits = subscription.plan[planField] || 0;

        // Ensure we don't exceed the plan's monthly limit
        const newCredits = Math.min(currentCredits + amount, maxCredits);

        await subscription.update({
            [creditField]: newCredits
        });

        return subscription;
    } catch (error) {
        console.error('Refund credits error:', error);
        throw error;
    }
};
