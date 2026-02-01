import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/client';

const useAffiliateStore = create(
    persist(
        (set, get) => ({
            affiliate: null,
            referrals: [],
            isLoading: false,
            error: null,

            // Fetch affiliate profile and stats
            fetchAffiliateStats: async () => {
                set({ isLoading: true });
                try {
                    const response = await apiClient.get('/affiliate/dashboard');
                    set({ affiliate: response.data.data, isLoading: false, error: null });
                } catch (error) {
                    set({
                        error: error.response?.data?.message || 'Failed to fetch affiliate stats',
                        isLoading: false
                    });
                }
            },

            // Fetch referrals list
            fetchReferrals: async () => {
                set({ isLoading: true });
                try {
                    const response = await apiClient.get('/affiliate/referrals');
                    set({ referrals: response.data.data, isLoading: false });
                } catch (error) {
                    set({
                        error: error.response?.data?.message || 'Failed to fetch referrals',
                        isLoading: false
                    });
                }
            },

            // Register as an affiliate
            registerAsAffiliate: async () => {
                set({ isLoading: true });
                try {
                    const response = await apiClient.post('/affiliate/register');
                    set({ affiliate: response.data.data, isLoading: false, error: null });
                    return response.data.data;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || 'Failed to register as affiliate',
                        isLoading: false
                    });
                    throw error;
                }
            },

            // Request payout
            requestPayout: async (amount, payoutDetails) => {
                set({ isLoading: true });
                try {
                    const response = await apiClient.post('/affiliate/payout-request', {
                        amount,
                        payoutDetails
                    });
                    set({ isLoading: false });
                    return response.data;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || 'Payout request failed',
                        isLoading: false
                    });
                    throw error;
                }
            },

            // Reset state
            reset: () => set({ affiliate: null, referrals: [], error: null })
        }),
        {
            name: 'affiliate-storage',
            partialize: (state) => ({ affiliate: state.affiliate }),
        }
    )
);

export default useAffiliateStore;
