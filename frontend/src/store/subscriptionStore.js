import { create } from 'zustand';
import { subscriptionsAPI } from '../api/subscriptions';
import { paymentsAPI } from '../api/payments';

const useSubscriptionStore = create((set, get) => ({
    plans: [],
    currentSubscription: null,
    paymentHistory: [],
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
                error: error.message || 'Failed to fetch plans',
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
            if (error.status === 404) {
                set({ currentSubscription: null, isLoading: false });
            } else {
                set({
                    error: error.message || 'Failed to fetch subscription',
                    isLoading: false,
                });
            }
        }
    },

    // Fetch payment history
    fetchPaymentHistory: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await paymentsAPI.getPaymentHistory();
            set({
                paymentHistory: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch payment history',
                isLoading: false,
            });
        }
    },

    // Subscribe to plan
    subscribe: async (planId, paymentData) => {
        set({ isLoading: true, error: null });
        try {
            const data = await subscriptionsAPI.createSubscription(planId, paymentData);
            set({
                currentSubscription: data.data,
                isLoading: false,
            });
            return { success: true, data: data.data };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Change plan
    changePlan: async (newPlanId) => {
        set({ isLoading: true, error: null });
        try {
            const data = await subscriptionsAPI.changeSubscriptionPlan(newPlanId);
            set({
                currentSubscription: data.data,
                isLoading: false,
            });
            return { success: true, data: data.data };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Cancel subscription
    cancelSubscription: async (paymentId) => {
        set({ isLoading: true, error: null });
        try {
            const data = await subscriptionsAPI.cancelSubscription(paymentId);
            set({
                currentSubscription: data.data,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useSubscriptionStore;
