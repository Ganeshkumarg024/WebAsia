import { Payment, Subscription, SubscriptionPlan, FinancialLog } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const paymentService = {
    /**
     * Process a successful checkout or payment capture
     */
    handleSuccessfulPayment: async (paymentData) => {
        const t = await sequelize.transaction();

        try {
            const {
                userId,
                planId,
                amount,
                currency,
                gateway,
                gatewayOrderId,
                gatewayPaymentId,
                gatewaySignature,
                paymentMethod,
                metadata
            } = paymentData;

            // 1. Find the plan
            const plan = await SubscriptionPlan.findByPk(planId);
            if (!plan) throw new Error('Subscription plan not found');

            // 2. Create or Update Subscription
            const startDate = new Date();
            const endDate = calculateEndDate(startDate, plan.duration);
            const nextBillingDate = new Date(endDate);
            const creditsResetDate = calculateEndDate(startDate, plan.duration);

            // Find existing subscription
            let subscription = await Subscription.findOne({
                where: { userId, status: { [Op.in]: ['active', 'past_due', 'paused'] } },
                transaction: t
            });

            if (subscription) {
                // Upgrade/Downgrade or Renew
                await subscription.update({
                    planId: plan.id,
                    status: 'active',
                    startDate,
                    endDate,
                    nextBillingDate,
                    graphicsCreditsRemaining: plan.monthlyGraphicsCredits,
                    videoCreditsRemaining: plan.monthlyVideoCredits,
                    webCreditsRemaining: plan.monthlyWebCredits,
                    creditsResetDate,
                    paymentMethod,
                    paymentId: gatewayPaymentId
                }, { transaction: t });
            } else {
                // New Subscription
                subscription = await Subscription.create({
                    userId,
                    planId: plan.id,
                    status: 'active',
                    startDate,
                    endDate,
                    nextBillingDate,
                    graphicsCreditsRemaining: plan.monthlyGraphicsCredits,
                    videoCreditsRemaining: plan.monthlyVideoCredits,
                    webCreditsRemaining: plan.monthlyWebCredits,
                    creditsResetDate,
                    paymentMethod,
                    paymentId: gatewayPaymentId
                }, { transaction: t });
            }

            // 3. Create Payment Record
            const payment = await Payment.create({
                userId,
                subscriptionId: subscription.id,
                amount,
                currency,
                status: 'completed',
                paymentMethod,
                paymentGateway: gateway,
                gatewayOrderId,
                gatewayPaymentId,
                gatewaySignature,
                paidAt: new Date(),
                metadata
            }, { transaction: t });

            // 4. Create Financial Log (Revenue)
            await FinancialLog.create({
                type: 'revenue',
                category: 'subscription',
                amount,
                currency,
                status: 'completed',
                paymentId: payment.id,
                userId,
                relatedId: subscription.id,
                description: `Subscription payment for ${plan.name} plan`,
                metadata: {
                    gateway,
                    gatewayPaymentId,
                    planId: plan.id
                }
            }, { transaction: t });

            // 5. Handle Affiliate Conversion
            try {
                const { affiliateService } = await import('./affiliate.service.js');
                await affiliateService.processReferralConversion(userId, subscription.id, amount, currency, payment.id);
            } catch (err) {
                console.error('Failed to process affiliate conversion:', err);
                // We don't throw here to avoid failing the payment process if affiliate processing fails
            }

            await t.commit();
            return { subscription, payment };
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    /**
     * Handle payment failure
     */
    handleFailedPayment: async (failureData) => {
        const { userId, gatewayOrderId, gatewayPaymentId, failureReason, gateway } = failureData;

        return await Payment.create({
            userId,
            amount: failureData.amount || 0,
            status: 'failed',
            paymentGateway: gateway,
            gatewayOrderId,
            gatewayPaymentId,
            failureReason
        });
    },

    /**
     * Handle Subscription Cancellation
     */
    handleSubscriptionCancellation: async (subscriptionId, gatewaySubscriptionId) => {
        const subscription = await Subscription.findOne({
            where: {
                [Op.or]: [
                    { id: subscriptionId },
                    { paymentId: gatewaySubscriptionId }
                ]
            }
        });

        if (subscription) {
            await subscription.update({
                status: 'cancelled',
                autoRenew: false,
                cancelledAt: new Date()
            });
        }
        return subscription;
    },

    /**
     * Handle Plan Change (Upgrade/Downgrade)
     */
    handlePlanChange: async (userId, newPlanId) => {
        const t = await sequelize.transaction();
        try {
            const subscription = await Subscription.findOne({
                where: { userId, status: 'active' },
                transaction: t
            });

            if (!subscription) throw new Error('No active subscription found');

            const newPlan = await SubscriptionPlan.findByPk(newPlanId);
            if (!newPlan) throw new Error('New plan not found');

            // Proration Logic (Simplified for now: Reset cycle and credits)
            const startDate = new Date();
            const endDate = calculateEndDate(startDate, newPlan.duration);

            await subscription.update({
                planId: newPlan.id,
                graphicsCreditsRemaining: newPlan.monthlyGraphicsCredits,
                videoCreditsRemaining: newPlan.monthlyVideoCredits,
                webCreditsRemaining: newPlan.monthlyWebCredits,
                endDate,
                nextBillingDate: endDate,
                creditsResetDate: endDate
            }, { transaction: t });

            await t.commit();
            return subscription;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    /**
     * Handle Subscription Renewal (Cron or Webhook)
     */
    handleSubscriptionRenewal: async (subscriptionId) => {
        const t = await sequelize.transaction();
        try {
            const subscription = await Subscription.findByPk(subscriptionId, {
                include: [{ model: SubscriptionPlan, as: 'plan' }],
                transaction: t
            });

            if (!subscription) throw new Error('Subscription not found');

            const startDate = new Date();
            const endDate = calculateEndDate(startDate, subscription.plan.duration);

            await subscription.update({
                startDate,
                endDate,
                nextBillingDate: endDate,
                graphicsCreditsRemaining: subscription.plan.monthlyGraphicsCredits,
                videoCreditsRemaining: subscription.plan.monthlyVideoCredits,
                webCreditsRemaining: subscription.plan.monthlyWebCredits,
                creditsResetDate: endDate
            }, { transaction: t });

            await t.commit();
            return subscription;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
};

// Helper functions (copied from subscription controller for now, should be centralized)
function calculateEndDate(startDate, duration) {
    const date = new Date(startDate);
    switch (duration) {
        case 'weekly': date.setDate(date.getDate() + 7); break;
        case 'monthly': date.setMonth(date.getMonth() + 1); break;
        case 'quarterly': date.setMonth(date.getMonth() + 3); break;
        case 'yearly': date.setFullYear(date.getFullYear() + 1); break;
        default: date.setMonth(date.getMonth() + 1);
    }
    return date;
}
