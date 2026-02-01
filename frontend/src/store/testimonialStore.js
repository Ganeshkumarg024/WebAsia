import { create } from 'zustand';
import apiClient from '../api/client';

const useTestimonialStore = create((set, get) => ({
    publicTestimonials: [],
    myTestimonials: [],
    isLoading: false,
    error: null,

    // Fetch public testimonials for landing page
    fetchPublicTestimonials: async () => {
        set({ isLoading: true });
        try {
            const response = await apiClient.get('/testimonials/public');
            set({ publicTestimonials: response.data.data, isLoading: false, error: null });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch testimonials',
                isLoading: false
            });
        }
    },

    // Fetch user's own testimonials
    fetchMyTestimonials: async () => {
        set({ isLoading: true });
        try {
            const response = await apiClient.get('/testimonials/my');
            set({ myTestimonials: response.data.data, isLoading: false, error: null });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch your feedback',
                isLoading: false
            });
        }
    },

    // Submit a new testimonial
    submitTestimonial: async (data) => {
        set({ isLoading: true });
        try {
            const response = await apiClient.post('/testimonials/submit', data);
            set({ isLoading: false, error: null });
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to submit feedback',
                isLoading: false
            });
            throw error;
        }
    }
}));

export default useTestimonialStore;
