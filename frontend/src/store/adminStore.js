import { create } from 'zustand';
import adminAPI from '../api/admin';

const useAdminStore = create((set, get) => ({
    users: [],
    designers: [], // Dedicated list for assignment dropdowns
    selectedUser: null,
    plans: [],
    pods: [],
    requests: [],
    stats: {}, // Dashboard stats
    financialStats: null,
    transactions: [],
    commThreads: [],
    selectedThread: null,
    analytics: null,
    testimonials: [],
    loading: false,
    error: null,

    // User Actions
    fetchUsers: async (params) => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getUsers(params);
            set({ users: response.data.users, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchDesigners: async () => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getUsers({ role: 'designer', status: 'active' });
            set({ designers: response.data.users, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createUser: async (userData) => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.createUser(userData);
            set((state) => ({
                users: [response.data, ...state.users],
                loading: false
            }));
            return { success: true, data: response.data };
        } catch (error) {
            set({ error: error.message, loading: false });
            return { success: false, error: error.message };
        }
    },

    updateUser: async (id, userData) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.updateUser(id, userData);
            set((state) => ({
                users: state.users.map((u) => (u.id === id ? { ...u, ...userData } : u)),
                loading: false
            }));
            return { success: true };
        } catch (error) {
            set({ error: error.message, loading: false });
            return { success: false, error: error.message };
        }
    },

    deleteUser: async (id) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.deleteUser(id);
            set((state) => ({
                users: state.users.filter((u) => u.id !== id),
                loading: false
            }));
            return { success: true };
        } catch (error) {
            set({ error: error.message, loading: false });
            return { success: false, error: error.message };
        }
    },

    resetUserPassword: async (userId, newPassword, sendEmail = false) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.resetUserPassword(userId, newPassword, sendEmail);
            set({ loading: false });
            return { success: true };
        } catch (error) {
            set({ error: error.message, loading: false });
            return { success: false, error: error.message };
        }
    },

    // Plan Actions
    fetchPlans: async () => {
        set({ loading: true, error: null });
        try {
            // Assuming a generic getPlans exists in common or within admin context
            const response = await adminAPI.getPlans();
            set({ plans: response.data, loading: false });

        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Pods Actions
    fetchPods: async () => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getPods();
            set({ pods: response.data.pods, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    assignDesignerToPod: async (podId, designerId) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.assignToPod({ podId, designerId });
            // Refresh pods
            const response = await adminAPI.getPods();
            set({ pods: response.data.pods, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Financial Actions
    fetchFinancials: async (period) => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getFinancialStats(period);
            set({ financialStats: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchTransactions: async (params) => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getTransactions(params);
            set({ transactions: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Communication Actions
    fetchCommThreads: async (params) => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getCommThreads(params);
            set({ commThreads: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchThreadDetails: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getCommThreadDetails(id);
            set({ selectedThread: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchTransactions: async (params) => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getTransactions(params);
            set({ transactions: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchRefundRequests: async () => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getRefundRequests();
            set({ refundQueue: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    handleRefund: async (id, actionData) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.handleRefund(id, actionData);
            // Refresh
            const [transData, refundData, finData] = await Promise.all([
                adminAPI.getTransactions(),
                adminAPI.getRefundRequests(),
                adminAPI.getFinancialStats()
            ]);
            set({
                transactions: transData.data,
                refundQueue: refundData.data,
                financialStats: finData.data,
                loading: false
            });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Global Request Actions
    fetchAdminRequests: async (params) => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getAllRequests(params);
            set({ requests: response.data.requests, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    bulkUpdateRequests: async (updateData) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.bulkUpdateRequests(updateData);
            // Refresh requests
            const response = await adminAPI.getAllRequests();
            set({ requests: response.data.requests, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    approveRequest: async (requestId, checklist) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.bulkUpdateRequests({
                requestIds: [requestId],
                status: 'completed',
                checklist // Optional: if backend supports saving checklist
            });
            // Refresh selected request
            const { data } = await adminAPI.getCommThreadDetails(requestId);
            set({ selectedThread: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    rejectRequest: async (requestId, feedback) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.bulkUpdateRequests({
                requestIds: [requestId],
                status: 'in_progress', // Move back to designer
                feedback
            });
            // Refresh selected request
            const { data } = await adminAPI.getCommThreadDetails(requestId);
            set({ selectedThread: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },



    fetchCommThreadDetails: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getCommThreadDetails(id);
            set({ selectedThread: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    flagCommThread: async (id, reason) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.flagCommThread(id, reason);
            // Refresh list
            const response = await adminAPI.getCommThreads();
            set({ commThreads: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchTestimonials: async (status) => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getTestimonials(status);
            set({ testimonials: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    approveTestimonial: async (id) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.approveTestimonial(id);
            // Refresh
            const response = await adminAPI.getTestimonials('pending');
            set({ testimonials: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    rejectTestimonial: async (id) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.rejectTestimonial(id);
            // Refresh
            const response = await adminAPI.getTestimonials('pending');
            set({ testimonials: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Pod Management Actions


    fetchUnassignedDesigners: async () => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getUnassignedDesigners();
            set({ unassignedDesigners: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },



    // Analytics
    fetchAdminAnalytics: async (period) => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getAnalytics(period);
            set({ analytics: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchStats: async () => {
        set({ loading: true, error: null });
        try {
            const response = await adminAPI.getDashboardStats();
            set({ stats: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Subscription Management
    subscriptionPlans: [],

    fetchSubscriptionPlans: async () => {
        try {
            const response = await adminAPI.getSubscriptionPlans();
            set({ subscriptionPlans: response.data || [] });
        } catch (error) {
            console.error('Failed to fetch subscription plans:', error);
            // Fallback to existing getPlans
            try {
                const response = await adminAPI.getPlans();
                set({ subscriptionPlans: response.data || [] });
            } catch (e) {
                set({ subscriptionPlans: [] });
            }
        }
    },

    assignSubscription: async (userId, planId, duration) => {
        try {
            const response = await adminAPI.assignSubscription(userId, planId, duration);
            return { success: true, data: response.data, message: response.message };
        } catch (error) {
            return { success: false, error: error.response?.data?.error?.message || error.message };
        }
    },

    removeSubscription: async (userId) => {
        try {
            const response = await adminAPI.removeSubscription(userId);
            return { success: true, message: response.message };
        } catch (error) {
            return { success: false, error: error.response?.data?.error?.message || error.message };
        }
    }
}));


export default useAdminStore;
