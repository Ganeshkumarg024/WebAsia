import apiClient from './client';

export const enterpriseAPI = {
    // Submit custom quote request
    submitQuoteRequest: async (quoteData) => {
        const response = await apiClient.post('/enterprise/quote-request', quoteData);
        return response.data;
    },

    // Get quote requests (admin)
    getQuoteRequests: async (params = {}) => {
        const response = await apiClient.get('/admin/enterprise/quotes', { params });
        return response.data;
    },

    // Get quote by ID
    getQuoteById: async (id) => {
        const response = await apiClient.get(`/enterprise/quotes/${id}`);
        return response.data;
    },

    // Update quote status (admin)
    updateQuoteStatus: async (id, status, notes) => {
        const response = await apiClient.put(`/admin/enterprise/quotes/${id}/status`, { status, notes });
        return response.data;
    },
};

export default enterpriseAPI;
