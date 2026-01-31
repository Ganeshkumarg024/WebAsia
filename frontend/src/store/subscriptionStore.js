import { create } from 'zustand';
import { subscriptionsAPI } from '../api/subscriptions';

const useSubscriptionStore = create((set, get) => ({
    plans: [],
    currentSubscription: null,
    subscriptions: [],
    usage: null,
    isLoading: false,
    error: null,

    // Fetch all plans
    fetchPlans: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await subscriptionsAPI.getPlans();
            set({
                plans: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.error?.message || 'Failed to fetch plans',
                isLoading: false,
            });
        }
    },

    // Fetch current subscription
    fetchCurrentSubscription: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await subscriptionsAPI.getCurrentSubscription();
            set({
                currentSubscription: data.data,
                isLoading: false,
            });
        } catch (error) {
            // If no subscription, it's not an error
            if (error.response?.status === 404) {
                set({ currentSubscription: null, isLoading: false });
            } else {
                set({
                    error: error.response?.data?.error?.message || 'Failed to fetch subscription',
                    isLoading: false,
                });
            }
        }
    },

    // Fetch all subscriptions
    fetchSubscriptions: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await subscriptionsAPI.getSubscriptions();
            set({
                subscriptions: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.error?.message || 'Failed to fetch subscriptions',
                isLoading: false,
            });
        }
    },

    // Subscribe to plan
    subscribe: async (planId, paymentMethodId) => {
        set({ isLoading: true, error: null });
        try {
            const data = await subscriptionsAPI.subscribe(planId, paymentMethodId);
            set({
                currentSubscription: data.data,
                isLoading: false,
            });
            return { success: true, data: data.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to subscribe';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Cancel subscription
    cancelSubscription: async (id, reason) => {
        set({ isLoading: true, error: null });
        try {
            const data = await subscriptionsAPI.cancelSubscription(id, reason);
            set({
                currentSubscription: data.data,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to cancel subscription';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Pause subscription
    pauseSubscription: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const data = await subscriptionsAPI.pauseSubscription(id);
            set({
                currentSubscription: data.data,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to pause subscription';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Resume subscription
    resumeSubscription: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const data = await subscriptionsAPI.resumeSubscription(id);
            set({
                currentSubscription: data.data,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to resume subscription';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Update payment method
    updatePaymentMethod: async (id, paymentMethodId) => {
        set({ isLoading: true, error: null });
        try {
            const data = await subscriptionsAPI.updatePaymentMethod(id, paymentMethodId);
            set({
                currentSubscription: data.data,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to update payment method';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Fetch usage
    fetchUsage: async (id) => {
        try {
            const data = await subscriptionsAPI.getUsage(id);
            set({ usage: data.data });
        } catch (error) {
            console.error('Failed to fetch usage:', error);
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useSubscriptionStore;
