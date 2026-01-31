import apiClient from './client';

export const feedbackAPI = {
    // Submit feedback for a request
    submitFeedback: async (requestId, feedback) => {
        const response = await apiClient.post(`/requests/${requestId}/feedback`, feedback);
        return response.data;
    },

    // Get feedback for a request
    getFeedback: async (requestId) => {
        const response = await apiClient.get(`/requests/${requestId}/feedback`);
        return response.data;
    },

    // Get all feedback (admin)
    getAllFeedback: async (params = {}) => {
        const response = await apiClient.get('/admin/feedback', { params });
        return response.data;
    },
};

export default feedbackAPI;
