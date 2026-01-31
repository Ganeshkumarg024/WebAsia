import apiClient from './client';

export const designerAPI = {
    // Get assigned requests
    getAssignedRequests: async (params = {}) => {
        const response = await apiClient.get('/designer/requests', { params });
        return response.data;
    },

    // Get request details
    getRequestDetails: async (id) => {
        const response = await apiClient.get(`/designer/requests/${id}`);
        return response.data;
    },

    // Update request status
    updateRequestStatus: async (id, status, notes) => {
        const response = await apiClient.put(`/designer/requests/${id}/status`, {
            status,
            notes,
        });
        return response.data;
    },

    // Upload design files
    uploadDesign: async (requestId, files, version, notes) => {
        const formData = new FormData();

        files.forEach(file => {
            formData.append('files', file);
        });

        if (version) formData.append('version', version);
        if (notes) formData.append('notes', notes);

        const response = await apiClient.post(
            `/designer/requests/${requestId}/designs`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    // Get workload statistics
    getWorkload: async () => {
        const response = await apiClient.get('/designer/workload');
        return response.data;
    },

    // Get dashboard stats
    getDashboardStats: async () => {
        const response = await apiClient.get('/designer/stats');
        return response.data;
    },

    // Add comment to request
    addComment: async (requestId, comment) => {
        const response = await apiClient.post(`/designer/requests/${requestId}/comments`, {
            comment,
        });
        return response.data;
    },

    // Request clarification
    requestClarification: async (requestId, message) => {
        const response = await apiClient.post(`/designer/requests/${requestId}/clarification`, {
            message,
        });
        return response.data;
    },
};

export default designerAPI;
