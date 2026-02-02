import apiClient from './client';

export const leadsAPI = {
    // Get all leads
    getLeads: async (filters = {}) => {
        const response = await apiClient.get('/admin/leads', { params: filters });
        return response.data;
    },

    // Get lead by ID
    getLeadById: async (id) => {
        const response = await apiClient.get(`/admin/leads/${id}`);
        return response.data;
    },

    // Create lead
    createLead: async (leadData) => {
        const response = await apiClient.post('/admin/leads', leadData);
        return response.data;
    },

    // Update lead status
    updateStatus: async (id, status, notes) => {
        const response = await apiClient.patch(`/admin/leads/${id}/status`, { status, notes });
        return response.data;
    },

    // Create quote for lead
    createQuote: async (leadId, quoteData) => {
        const response = await apiClient.post(`/admin/leads/${leadId}/quote`, quoteData);
        return response.data;
    },

    // Convert lead to customer
    convertToCustomer: async (id, subscriptionData) => {
        const response = await apiClient.post(`/admin/leads/${id}/convert`, subscriptionData);
        return response.data;
    },

    // Add note to lead
    addNote: async (id, note) => {
        const response = await apiClient.post(`/admin/leads/${id}/notes`, { note });
        return response.data;
    },
};

export default leadsAPI;
