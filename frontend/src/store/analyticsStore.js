import { create } from 'zustand';
import { designerAPI } from '../api/designer';

const useAnalyticsStore = create((set, get) => ({
    analytics: null,
    period: 'month',
    isLoading: false,
    error: null,

    // Fetch analytics
    fetchAnalytics: async (period = 'month') => {
        set({ isLoading: true, error: null, period });
        try {
            const data = await designerAPI.getAnalytics(period);
            set({
                analytics: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch analytics',
                isLoading: false,
            });
        }
    },

    // Change period
    setPeriod: (period) => {
        set({ period });
        get().fetchAnalytics(period);
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useAnalyticsStore;
