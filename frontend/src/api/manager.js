import apiClient from './client';

export const managerAPI = {
    // Get pending (unassigned) requests
    getPendingRequests: async (params = {}) => {
        const response = await apiClient.get('/manager/requests/pending', { params });
        return response.data;
    },

    // Get all requests
    getAllRequests: async (params = {}) => {
        const response = await apiClient.get('/manager/requests', { params });
        return response.data;
    },

    // Assign request to designer
    assignRequest: async (requestId, designerId, priority, deadline) => {
        const response = await apiClient.post(`/manager/requests/${requestId}/assign`, {
            designerId,
            priority,
            deadline,
        });
        return response.data;
    },

    // Reassign request
    reassignRequest: async (requestId, designerId, reason) => {
        const response = await apiClient.put(`/manager/requests/${requestId}/reassign`, {
            designerId,
            reason,
        });
        return response.data;
    },

    // Get all designers
    getDesigners: async () => {
        const response = await apiClient.get('/manager/designers');
        return response.data;
    },

    // Get designer details
    getDesignerDetails: async (id) => {
        const response = await apiClient.get(`/manager/designers/${id}`);
        return response.data;
    },

    // Get team workload
    getTeamWorkload: async () => {
        const response = await apiClient.get('/manager/workload');
        return response.data;
    },

    // Get dashboard statistics
    getDashboardStats: async () => {
        const response = await apiClient.get('/manager/stats');
        return response.data;
    },

    // Update request priority
    updatePriority: async (requestId, priority) => {
        const response = await apiClient.put(`/manager/requests/${requestId}/priority`, {
            priority,
        });
        return response.data;
    },

    // Get performance metrics
    getPerformanceMetrics: async (designerId, period) => {
        const response = await apiClient.get(`/manager/designers/${designerId}/metrics`, {
            params: { period },
        });
        return response.data;
    },
};

export default managerAPI;
