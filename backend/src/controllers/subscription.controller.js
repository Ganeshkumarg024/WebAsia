import { Subscription, SubscriptionPlan, User } from '../models/index.js';
import { Op } from 'sequelize';

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
        const { planId, paymentId, paymentMethod } = req.body;

        // Check if user already has an active subscription
        const existingSubscription = await Subscription.findOne({
            where: {
                userId: req.user.id,
                status: 'active'
            }
        });

        if (existingSubscription) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'CONFLICT',
                    message: 'User already has an active subscription'
                }
            });
        }

        // Get plan details
        const plan = await SubscriptionPlan.findByPk(planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Subscription plan not found'
                }
            });
        }

        // Calculate dates
        const startDate = new Date();
        const endDate = calculateEndDate(startDate, plan.duration);
        const nextBillingDate = new Date(endDate);
        const creditsResetDate = calculateCreditsResetDate(startDate, plan.duration);

        // Create subscription
        const subscription = await Subscription.create({
            userId: req.user.id,
            planId: plan.id,
            status: 'active',
            startDate,
            endDate,
            nextBillingDate,
            autoRenew: true,
            graphicsCreditsRemaining: plan.monthlyGraphicsCredits,
            videoCreditsRemaining: plan.monthlyVideoCredits,
            webCreditsRemaining: plan.monthlyWebCredits,
            creditsResetDate,
            paymentMethod,
            paymentId
        });

        // Load plan details
        await subscription.reload({
            include: [{ model: SubscriptionPlan, as: 'plan' }]
        });

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: subscription
        });
    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to create subscription'
            }
        });
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const { reason } = req.body;

        const subscription = await Subscription.findOne({
            where: {
                userId: req.user.id,
                status: 'active'
            }
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'No active subscription found'
                }
            });
        }

        await subscription.update({
            status: 'cancelled',
            autoRenew: false,
            cancelledAt: new Date(),
            cancellationReason: reason
        });

        res.json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: subscription
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

        const subscription = await Subscription.findOne({
            where: {
                userId: req.user.id,
                status: 'active'
            }
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'No active subscription found'
                }
            });
        }

        const newPlan = await SubscriptionPlan.findByPk(newPlanId);
        if (!newPlan) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'New plan not found'
                }
            });
        }

        // Update subscription with new plan
        await subscription.update({
            planId: newPlan.id,
            graphicsCreditsRemaining: newPlan.monthlyGraphicsCredits,
            videoCreditsRemaining: newPlan.monthlyVideoCredits,
            webCreditsRemaining: newPlan.monthlyWebCredits
        });

        await subscription.reload({
            include: [{ model: SubscriptionPlan, as: 'plan' }]
        });

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
                message: 'Failed to update subscription plan'
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

// Helper functions
function calculateEndDate(startDate, duration) {
    const date = new Date(startDate);

    switch (duration) {
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
        default:
            date.setMonth(date.getMonth() + 1);
    }

    return date;
}

function calculateCreditsResetDate(startDate, duration) {
    return calculateEndDate(startDate, duration);
}
