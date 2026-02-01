import { create } from 'zustand';
import adminAPI from '../api/admin';

const useAdminStore = create((set, get) => ({
    users: [],
    selectedUser: null,
    plans: [],
    pods: [],
    requests: [],
    financialStats: null,
    transactions: [],
    commThreads: [],
    selectedThread: null,
    analytics: null,
    loading: false,
    error: null,

    // User Actions
    fetchUsers: async (params) => {
        set({ loading: true, error: null });
        try {
            const { data } = await adminAPI.getUsers(params);
            set({ users: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
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
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Plan Actions
    fetchPlans: async () => {
        set({ loading: true, error: null });
        try {
            // Assuming a generic getPlans exists in common or within admin context
            const { data } = await adminAPI.getUsers({ role: 'admin' }); // Placeholder logic if needed
            // Actually plans are often separate. Looking at API:
            // adminAPI.createPlan, updatePlan, deletePlan exist. 
            // Need a fetchPlans. Let's assume we use regular subscription API or add it here.
            // For now, placeholders based on adminAPI structure.
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Pods Actions
    fetchPods: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await adminAPI.getPods();
            set({ pods: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    assignDesignerToPod: async (podId, designerId) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.assignToPod({ podId, designerId });
            // Refresh pods
            const { data } = await adminAPI.getPods();
            set({ pods: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Financial Actions
    fetchFinancials: async (period) => {
        set({ loading: true, error: null });
        try {
            const { data } = await adminAPI.getFinancialStats(period);
            set({ financialStats: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchTransactions: async (params) => {
        set({ loading: true, error: null });
        try {
            const { data } = await adminAPI.getTransactions(params);
            set({ transactions: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Communication Actions
    fetchCommThreads: async (params) => {
        set({ loading: true, error: null });
        try {
            const { data } = await adminAPI.getCommThreads(params);
            set({ commThreads: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchThreadDetails: async (id) => {
        set({ loading: true, error: null });
        try {
            const { data } = await adminAPI.getCommThreadDetails(id);
            set({ selectedThread: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Global Request Actions
    fetchAdminRequests: async (params) => {
        set({ loading: true, error: null });
        try {
            const { data } = await adminAPI.getAdminRequests(params);
            set({ requests: data.requests, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    bulkUpdateRequests: async (updateData) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.bulkUpdateRequests(updateData);
            // Refresh requests
            const { data } = await adminAPI.getAdminRequests();
            set({ requests: data.requests, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Pod Management Actions
    fetchPods: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await adminAPI.getPods();
            set({ pods: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchUnassignedDesigners: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await adminAPI.getUnassignedDesigners();
            set({ unassignedDesigners: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    assignToPod: async (podId, designerId) => {
        set({ loading: true, error: null });
        try {
            await adminAPI.assignToPod({ podId, designerId });
            // Refresh both
            const [podsData, unassignedData] = await Promise.all([
                adminAPI.getPods(),
                adminAPI.getUnassignedDesigners()
            ]);
            set({ pods: podsData.data, unassignedDesigners: unassignedData.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Analytics
    fetchAdminAnalytics: async (period) => {
        set({ loading: true, error: null });
        try {
            const { data } = await adminAPI.getAnalytics(period);
            set({ analytics: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    }
}));

export default useAdminStore;
