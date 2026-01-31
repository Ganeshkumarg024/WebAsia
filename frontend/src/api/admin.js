import apiClient from './client';

export const adminAPI = {
    // User Management
    getUsers: async (params = {}) => {
        const response = await apiClient.get('/admin/users', { params });
        return response.data;
    },

    getUserById: async (id) => {
        const response = await apiClient.get(`/admin/users/${id}`);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await apiClient.post('/admin/users', userData);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await apiClient.put(`/admin/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await apiClient.delete(`/admin/users/${id}`);
        return response.data;
    },

    updateUserRole: async (userId, role) => {
        const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
        return response.data;
    },

    updateUserStatus: async (userId, status) => {
        const response = await apiClient.put(`/admin/users/${userId}/status`, { status });
        return response.data;
    },

    // Analytics
    getAnalytics: async (period = '30d') => {
        const response = await apiClient.get('/admin/analytics', {
            params: { period },
        });
        return response.data;
    },

    getRevenueStats: async (period = '30d') => {
        const response = await apiClient.get('/admin/analytics/revenue', {
            params: { period },
        });
        return response.data;
    },

    getUserStats: async () => {
        const response = await apiClient.get('/admin/analytics/users');
        return response.data;
    },

    getRequestStats: async () => {
        const response = await apiClient.get('/admin/analytics/requests');
        return response.data;
    },

    // System Stats
    getSystemStats: async () => {
        const response = await apiClient.get('/admin/system/stats');
        return response.data;
    },

    // Subscription Plans Management
    createPlan: async (planData) => {
        const response = await apiClient.post('/admin/plans', planData);
        return response.data;
    },

    updatePlan: async (id, planData) => {
        const response = await apiClient.put(`/admin/plans/${id}`, planData);
        return response.data;
    },

    deletePlan: async (id) => {
        const response = await apiClient.delete(`/admin/plans/${id}`);
        return response.data;
    },

    // Settings
    getSettings: async () => {
        const response = await apiClient.get('/admin/settings');
        return response.data;
    },

    updateSettings: async (settings) => {
        const response = await apiClient.put('/admin/settings', settings);
        return response.data;
    },
};

export default adminAPI;
