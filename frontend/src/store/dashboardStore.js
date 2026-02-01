import { create } from 'zustand';
import { dashboardAPI } from '../api/dashboard';

const useDashboardStore = create((set, get) => ({
    stats: null,
    deliveries: [],
    subscription: null,
    testimonials: [],
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    },

    // Fetch dashboard statistics
    fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await dashboardAPI.getStats();
            set({
                stats: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch dashboard stats',
                isLoading: false,
            });
        }
    },

    // Fetch deliveries
    fetchDeliveries: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const data = await dashboardAPI.getDeliveries(params);
            set({
                deliveries: data.data.deliveries,
                pagination: data.data.pagination,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch deliveries',
                isLoading: false,
            });
        }
    },

    // Fetch subscription
    fetchSubscription: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await dashboardAPI.getSubscription();
            set({
                subscription: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch subscription',
                isLoading: false,
            });
        }
    },

    // Fetch testimonials
    fetchTestimonials: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await dashboardAPI.getTestimonials();
            set({
                testimonials: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch testimonials',
                isLoading: false,
            });
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useDashboardStore;
