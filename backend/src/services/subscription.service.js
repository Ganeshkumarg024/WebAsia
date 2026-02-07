import { Subscription, SubscriptionPlan, User } from '../models/index.js';
import { Op } from 'sequelize';

export const subscriptionService = {
    /**
     * Check and handle expired subscriptions for a user
     */
    checkSubscriptionStatus: async (userId) => {
        try {
            const now = new Date();

            // Find active or past_due subscriptions that have passed their end date
            const expiredSubscriptions = await Subscription.findAll({
                where: {
                    userId,
                    status: { [Op.in]: ['active', 'past_due'] },
                    endDate: { [Op.lt]: now }
                }
            });

            for (const subscription of expiredSubscriptions) {
                // If auto-renew is on, we might want to trigger a renewal process here
                // For now, following user requirement: move to "No Subscription" (expired)
                await subscription.update({
                    status: 'expired',
                    graphicsCreditsRemaining: 0,
                    videoCreditsRemaining: 0,
                    webCreditsRemaining: 0
                });

                // Optionally, we could create a system notification for the user
                console.log(`Subscription ${subscription.id} for user ${userId} has expired.`);
            }

            return true;
        } catch (error) {
            console.error('Check subscription status error:', error);
            return false;
        }
    },

    /**
     * Get user's current effective plan and limits
     */
    getUserCurrentPlan: async (userId) => {
        // Run expiry check first
        await subscriptionService.checkSubscriptionStatus(userId);

        const subscription = await Subscription.findOne({
            where: {
                userId,
                status: 'active'
            },
            include: [{ model: SubscriptionPlan, as: 'plan' }]
        });

        if (!subscription) {
            return null; // No active subscription
        }

        return subscription;
    }
};
