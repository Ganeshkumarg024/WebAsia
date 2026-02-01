import apiClient from './client';

export const dashboardAPI = {
    // Get dashboard statistics
    getStats: async () => {
        const response = await apiClient.get('/client/dashboard/stats');
        return response.data;
    },

    // Get deliveries
    getDeliveries: async (params = {}) => {
        const response = await apiClient.get('/client/deliveries', { params });
        return response.data;
    },

    // Get subscription details
    getSubscription: async () => {
        const response = await apiClient.get('/client/subscription');
        return response.data;
    },

    // Get testimonials
    getTestimonials: async () => {
        const response = await apiClient.get('/client/testimonials');
        return response.data;
    }
};

export default dashboardAPI;
