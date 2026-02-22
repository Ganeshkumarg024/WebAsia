import apiClient from './client';

export const affiliateAPI = {
    // ========================
    // AFFILIATE PORTAL APIs
    // ========================

    // Register as affiliate
    register: async (applicationNote) => {
        const response = await apiClient.post('/affiliate/register', { applicationNote });
        return response.data;
    },

    // Get affiliate dashboard data
    getDashboard: async () => {
        const response = await apiClient.get('/affiliate/dashboard');
        return response.data;
    },

    // Get referrals
    getReferrals: async (params = {}) => {
        const response = await apiClient.get('/affiliate/referrals', { params });
        return response.data;
    },

    // Get earnings
    getEarnings: async (period = '30d') => {
        const response = await apiClient.get('/affiliate/earnings', { params: { period } });
        return response.data;
    },

    // Get referral link
    getReferralLink: async () => {
        const response = await apiClient.get('/affiliate/referral-link');
        return response.data;
    },

    // Get payout settings
    getPayoutSettings: async () => {
        const response = await apiClient.get('/affiliate/settings/payout');
        return response.data;
    },

    // Update payout settings
    updatePayoutSettings: async (settings) => {
        const response = await apiClient.put('/affiliate/settings/payout', settings);
        return response.data;
    },

    // Request payout
    requestPayout: async (amount) => {
        const response = await apiClient.post('/affiliate/payout-request', { amount });
        return response.data;
    },

    // Get payout history (affiliate's own)
    getPayouts: async () => {
        const response = await apiClient.get('/affiliate/payouts');
        return response.data;
    },

    // Get marketing materials
    getMarketingMaterials: async (category) => {
        const response = await apiClient.get('/affiliate/marketing-materials', { params: { category } });
        return response.data;
    },

    // ========================
    // ADMIN AFFILIATE APIs
    // ========================

    // Get all affiliates (admin)
    adminGetAffiliates: async (params = {}) => {
        const response = await apiClient.get('/admin/affiliates', { params });
        return response.data;
    },

    // Get affiliate detail (admin)
    adminGetAffiliateDetail: async (id) => {
        const response = await apiClient.get(`/admin/affiliates/${id}`);
        return response.data;
    },

    // Approve affiliate (admin)
    adminApproveAffiliate: async (id) => {
        const response = await apiClient.post(`/admin/affiliates/${id}/approve`);
        return response.data;
    },

    // Reject affiliate (admin)
    adminRejectAffiliate: async (id, reason) => {
        const response = await apiClient.post(`/admin/affiliates/${id}/reject`, { reason });
        return response.data;
    },

    // Update affiliate status (admin)
    adminUpdateAffiliateStatus: async (id, status) => {
        const response = await apiClient.put(`/admin/affiliates/${id}/status`, { status });
        return response.data;
    },

    // Update affiliate commission (admin)
    adminUpdateCommission: async (id, commissionRate) => {
        const response = await apiClient.put(`/admin/affiliates/${id}/commission`, { commissionRate });
        return response.data;
    },

    // Get all payouts (admin)
    adminGetPayouts: async (params = {}) => {
        const response = await apiClient.get('/admin/affiliate/payouts', { params });
        return response.data;
    },

    // Approve payout (admin)
    adminApprovePayout: async (id, data = {}) => {
        const response = await apiClient.post(`/admin/affiliate/payouts/${id}/approve`, data);
        return response.data;
    },

    // Reject payout (admin)
    adminRejectPayout: async (id, reason) => {
        const response = await apiClient.post(`/admin/affiliate/payouts/${id}/reject`, { reason });
        return response.data;
    },

    // Mark payout as paid (admin)
    adminMarkPayoutPaid: async (id, transactionRef) => {
        const response = await apiClient.post(`/admin/affiliate/payouts/${id}/paid`, { transactionRef });
        return response.data;
    },

    // Bulk payout action (admin)
    adminBulkPayoutAction: async (payoutIds, action) => {
        const response = await apiClient.post('/admin/affiliate/payouts/bulk', { payoutIds, action });
        return response.data;
    },

    // Fraud detection (admin)
    adminGetFraudFlags: async () => {
        const response = await apiClient.get('/admin/affiliate/fraud');
        return response.data;
    },

    // Get affiliate resources (admin)
    adminGetResources: async () => {
        const response = await apiClient.get('/admin/affiliate/resources');
        return response.data;
    },

    // Create affiliate resource (admin)
    adminCreateResource: async (data) => {
        const response = await apiClient.post('/admin/affiliate/resources', data);
        return response.data;
    },

    // Delete affiliate resource (admin)
    adminDeleteResource: async (id) => {
        const response = await apiClient.delete(`/admin/affiliate/resources/${id}`);
        return response.data;
    },

    // Toggle affiliate resource (admin)
    adminToggleResource: async (id) => {
        const response = await apiClient.patch(`/admin/affiliate/resources/${id}/toggle`);
        return response.data;
    },

    // Legacy — kept for backward compatibility
    approvePayout: async (id) => {
        const response = await apiClient.post(`/admin/affiliate/payouts/${id}/approve`);
        return response.data;
    },

    getPayoutsPending: async () => {
        const response = await apiClient.get('/admin/affiliate/payouts', { params: { status: 'requested' } });
        return response.data;
    },

    // User Profile management
    getUserProfile: async () => {
        const response = await apiClient.get('/users/me');
        return response.data;
    },

    updateUserProfile: async (profileData) => {
        const response = await apiClient.put('/users/me', profileData);
        return response.data;
    }
};

export default affiliateAPI;
