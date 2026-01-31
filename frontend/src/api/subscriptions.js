import apiClient from './client';

export const subscriptionsAPI = {
    // Get all subscription plans
    getPlans: async () => {
        const response = await apiClient.get('/subscription-plans');
        return response.data;
    },

    // Get plan by ID
    getPlanById: async (id) => {
        const response = await apiClient.get(`/subscription-plans/${id}`);
        return response.data;
    },

    // Get current user's subscription
    getCurrentSubscription: async () => {
        const response = await apiClient.get('/subscriptions/current');
        return response.data;
    },

    // Get all user subscriptions
    getSubscriptions: async () => {
        const response = await apiClient.get('/subscriptions');
        return response.data;
    },

    // Create new subscription
    subscribe: async (planId, paymentMethodId) => {
        const response = await apiClient.post('/subscriptions', {
            planId,
            paymentMethodId,
        });
        return response.data;
    },

    // Cancel subscription
    cancelSubscription: async (id, reason) => {
        const response = await apiClient.post(`/subscriptions/${id}/cancel`, { reason });
        return response.data;
    },

    // Pause subscription
    pauseSubscription: async (id) => {
        const response = await apiClient.post(`/subscriptions/${id}/pause`);
        return response.data;
    },

    // Resume subscription
    resumeSubscription: async (id) => {
        const response = await apiClient.post(`/subscriptions/${id}/resume`);
        return response.data;
    },

    // Update payment method
    updatePaymentMethod: async (id, paymentMethodId) => {
        const response = await apiClient.put(`/subscriptions/${id}/payment-method`, {
            paymentMethodId,
        });
        return response.data;
    },

    // Get subscription usage
    getUsage: async (id) => {
        const response = await apiClient.get(`/subscriptions/${id}/usage`);
        return response.data;
    },
};

export default subscriptionsAPI;
