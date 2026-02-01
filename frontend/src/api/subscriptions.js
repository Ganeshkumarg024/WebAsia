import apiClient from './client';

export const subscriptionsAPI = {
    // Get all available plans
    getPlans: async () => {
        const response = await apiClient.get('/subscription-plans');
        return response.data;
    },

    // Get current subscription
    getCurrentSubscription: async () => {
        const response = await apiClient.get('/subscriptions/current');
        return response.data;
    },

    // Create subscription
    createSubscription: async (planId, paymentData) => {
        const response = await apiClient.post('/subscriptions/create', { planId, ...paymentData });
        return response.data;
    },

    // Upgrade subscription
    upgradeSubscription: async (newPlanId) => {
        const response = await apiClient.post('/subscriptions/upgrade', { planId: newPlanId });
        return response.data;
    },

    // Downgrade subscription
    downgradeSubscription: async (newPlanId) => {
        const response = await apiClient.post('/subscriptions/downgrade', { planId: newPlanId });
        return response.data;
    },

    // Cancel subscription
    cancelSubscription: async (reason) => {
        const response = await apiClient.post('/subscriptions/cancel', { reason });
        return response.data;
    },

    // Reactivate subscription
    reactivateSubscription: async () => {
        const response = await apiClient.post('/subscriptions/reactivate');
        return response.data;
    },

    // Get subscription history
    getSubscriptionHistory: async () => {
        const response = await apiClient.get('/subscriptions/history');
        return response.data;
    }
};

export default subscriptionsAPI;
