import apiClient from './client';

export const requestsAPI = {
    // Create new design request
    createRequest: async (requestData) => {
        const response = await apiClient.post('/requests', requestData);
        return response.data;
    },

    // Get all user requests with pagination
    getRequests: async (params = {}) => {
        const response = await apiClient.get('/requests', { params });
        return response.data;
    },

    // Get single request by ID
    getRequestById: async (id) => {
        const response = await apiClient.get(`/requests/${id}`);
        return response.data;
    },

    // Update request
    updateRequest: async (id, data) => {
        const response = await apiClient.put(`/requests/${id}`, data);
        return response.data;
    },

    // Delete request
    deleteRequest: async (id) => {
        const response = await apiClient.delete(`/requests/${id}`);
        return response.data;
    },

    // Add revision feedback
    addRevision: async (id, feedback) => {
        const response = await apiClient.post(`/requests/${id}/revisions`, { feedback });
        return response.data;
    },

    // Approve design
    approveDesign: async (id) => {
        const response = await apiClient.post(`/requests/${id}/approve`);
        return response.data;
    },

    // Upload reference files
    uploadReferences: async (id, files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await apiClient.post(`/requests/${id}/references`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get request statistics
    getStats: async () => {
        const response = await apiClient.get('/requests/stats');
        return response.data;
    },
};

export default requestsAPI;
