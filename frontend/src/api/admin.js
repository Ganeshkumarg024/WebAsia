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

    getDashboardStats: async () => {
        const response = await apiClient.get('/admin/dashboard/stats');
        return response.data;
    },

    // Subscription Plans Management
    getPlans: async () => {
        const response = await apiClient.get('/subscription-plans');
        return response.data;
    },

    getPlan: async (id) => {
        const response = await apiClient.get(`/subscription-plans/${id}`);
        return response.data;
    },

    createPlan: async (planData) => {
        const response = await apiClient.post('/subscription-plans', planData);
        return response.data;
    },

    updatePlan: async (id, planData) => {
        const response = await apiClient.put(`/subscription-plans/${id}`, planData);
        return response.data;
    },

    deletePlan: async (id) => {
        const response = await apiClient.delete(`/subscription-plans/${id}`);
        return response.data;
    },

    // Pod Management
    getPods: async () => {
        const response = await apiClient.get('/admin/pods');
        return response.data;
    },

    assignToPod: async (assignmentData) => {
        const response = await apiClient.post('/admin/pods/assign', assignmentData);
        return response.data;
    },

    removeFromPod: async (podId, userId) => {
        const response = await apiClient.delete(`/admin/pods/${podId}/member/${userId}`);
        return response.data;
    },

    getTeamMapping: async () => {
        const response = await apiClient.get('/admin/team-mapping');
        return response.data;
    },

    fetchTeamMapping: async () => {
        const response = await apiClient.get('/admin/team-mapping');
        return response.data;
    },

    getUnassignedDesigners: async () => {
        const response = await apiClient.get('/admin/designers/unassigned');
        return response.data;
    },

    // Financials
    getFinancialStats: async (period = '30d') => {
        const response = await apiClient.get('/admin/financials/stats', { params: { period } });
        return response.data;
    },

    getTransactions: async (params = {}) => {
        const response = await apiClient.get('/admin/financials/transactions', { params });
        return response.data;
    },

    getRefundRequests: async () => {
        const response = await apiClient.get('/admin/financials/refunds');
        return response.data;
    },

    handleRefund: async (id, actionData) => {
        const response = await apiClient.post(`/admin/financials/refunds/${id}`, actionData);
        return response.data;
    },

    // Communication Hub
    getCommThreads: async (params = {}) => {
        const response = await apiClient.get('/admin/comm/threads', { params });
        return response.data;
    },

    getCommThreadDetails: async (id) => {
        const response = await apiClient.get(`/admin/comm/threads/${id}`);
        return response.data;
    },

    flagCommThread: async (id, reason) => {
        const response = await apiClient.post(`/admin/comm/threads/${id}/flag`, { reason });
        return response.data;
    },

    // Global Request Management
    getAdminRequests: async (params = {}) => {
        const response = await apiClient.get('/admin/requests', { params });
        return response.data;
    },

    bulkUpdateRequests: async (updateData) => {
        const response = await apiClient.patch('/admin/requests/bulk', updateData);
        return response.data;
    },

    // Testimonials
    getTestimonials: async (status = 'pending') => {
        const response = await apiClient.get('/admin/testimonials', { params: { status } });
        return response.data;
    },

    approveTestimonial: async (id) => {
        const response = await apiClient.post(`/admin/testimonials/${id}/approve`);
        return response.data;
    },

    rejectTestimonial: async (id) => {
        const response = await apiClient.post(`/admin/testimonials/${id}/reject`);
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
