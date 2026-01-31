import { create } from 'zustand';
import { requestsAPI } from '../api/requests';

const useRequestStore = create((set, get) => ({
    requests: [],
    currentRequest: null,
    stats: null,
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },

    // Fetch all requests
    fetchRequests: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const data = await requestsAPI.getRequests(params);
            set({
                requests: data.data.requests,
                pagination: data.data.pagination,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.error?.message || 'Failed to fetch requests',
                isLoading: false,
            });
        }
    },

    // Fetch single request
    fetchRequestById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const data = await requestsAPI.getRequestById(id);
            set({
                currentRequest: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.error?.message || 'Failed to fetch request',
                isLoading: false,
            });
        }
    },

    // Create new request
    createRequest: async (requestData) => {
        set({ isLoading: true, error: null });
        try {
            const data = await requestsAPI.createRequest(requestData);
            set((state) => ({
                requests: [data.data, ...state.requests],
                isLoading: false,
            }));
            return { success: true, data: data.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to create request';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Update request
    updateRequest: async (id, requestData) => {
        set({ isLoading: true, error: null });
        try {
            const data = await requestsAPI.updateRequest(id, requestData);
            set((state) => ({
                requests: state.requests.map((req) =>
                    req.id === id ? data.data : req
                ),
                currentRequest: state.currentRequest?.id === id ? data.data : state.currentRequest,
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to update request';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Delete request
    deleteRequest: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await requestsAPI.deleteRequest(id);
            set((state) => ({
                requests: state.requests.filter((req) => req.id !== id),
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to delete request';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Add revision
    addRevision: async (id, feedback) => {
        set({ isLoading: true, error: null });
        try {
            const data = await requestsAPI.addRevision(id, feedback);
            set((state) => ({
                currentRequest: data.data,
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to add revision';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Approve design
    approveDesign: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const data = await requestsAPI.approveDesign(id);
            set((state) => ({
                currentRequest: data.data,
                requests: state.requests.map((req) =>
                    req.id === id ? data.data : req
                ),
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to approve design';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Fetch stats
    fetchStats: async () => {
        try {
            const data = await requestsAPI.getStats();
            set({ stats: data.data });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Clear current request
    clearCurrentRequest: () => set({ currentRequest: null }),
}));

export default useRequestStore;
