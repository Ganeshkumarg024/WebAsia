import apiClient from './client';

export const subscriptionsAPI = {
    // Get all available plans
    getPlans: async () => {
        const response = await apiClient.get('/subscription-plans');
        return response.data;
    },

    // Get current subscription
    getCurrentSubscription: async () => {
        const response = await apiClient.get('/subscriptions/me');
        return response.data;
    },

    // Create subscription
    createSubscription: async (planId, paymentData) => {
        const response = await apiClient.post('/subscriptions', { planId, ...paymentData });
        return response.data;
    },

    // Upgrade/Downgrade subscription
    changeSubscriptionPlan: async (newPlanId) => {
        const response = await apiClient.put('/subscriptions/change-plan', { newPlanId });
        return response.data;
    },

    // Cancel subscription
    cancelSubscription: async (paymentId) => {
        const response = await apiClient.post('/subscriptions/cancel', { paymentId });
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
