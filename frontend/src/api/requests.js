import apiClient from './client';

export const requestsAPI = {
    // Create new design request
    createRequest: async (requestData) => {
        const response = await apiClient.post('/requests', requestData);
        return response.data;
    },

    // Get all user requests
    getMyRequests: async (params = {}) => {
        const response = await apiClient.get('/requests/my-requests', { params });
        return response.data;
    },

    // Get single request by ID
    getRequestById: async (id) => {
        const response = await apiClient.get(`/requests/${id}`);
        return response.data;
    },

    // Update request status
    updateRequestStatus: async (id, status, feedback = null) => {
        const response = await apiClient.patch(`/requests/${id}/status`, { status, feedback });
        return response.data;
    },

    // Cancel request
    cancelRequest: async (id, reason) => {
        const response = await apiClient.post(`/requests/${id}/cancel`, { reason });
        return response.data;
    },

    // Upload reference files
    uploadFiles: async (id, files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await apiClient.post(`/requests/${id}/upload-files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Submit feedback/revision request
    submitFeedback: async (id, feedback) => {
        const response = await apiClient.post(`/requests/${id}/feedback`, { feedback });
        return response.data;
    },

    // Approve final delivery
    approveRequest: async (id) => {
        const response = await apiClient.post(`/requests/${id}/approve`);
        return response.data;
    },

    // Get request activity timeline
    getRequestActivity: async (id) => {
        const response = await apiClient.get(`/requests/${id}/activity`);
        return response.data;
    },

    // Change request priority
    changePriority: async (id, priority) => {
        const response = await apiClient.patch(`/requests/${id}/priority`, { priority });
        return response.data;
    }
};

export default requestsAPI;
