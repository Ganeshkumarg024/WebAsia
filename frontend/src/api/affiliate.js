import apiClient from './client';

export const affiliateAPI = {
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

    // Get pending payouts (admin)
    getPendingPayouts: async () => {
        const response = await apiClient.get('/admin/affiliate/payouts/pending');
        return response.data;
    },

    // Process payout (admin)
    processPayout: async (id, paymentDetails) => {
        const response = await apiClient.post(`/admin/affiliate/payouts/${id}/process`, paymentDetails);
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

    // Get referral link
    getReferralLink: async () => {
        const response = await apiClient.get('/affiliate/referral-link');
        return response.data;
    },

    // Get marketing materials
    getMarketingMaterials: async () => {
        const response = await apiClient.get('/affiliate/marketing-materials');
        return response.data;
    },
};

export default affiliateAPI;
