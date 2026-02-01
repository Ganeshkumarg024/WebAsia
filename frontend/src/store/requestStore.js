import { create } from 'zustand';
import { requestsAPI } from '../api/requests';

const useRequestStore = create((set, get) => ({
    requests: [],
    currentRequest: null,
    requestActivity: [],
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
            const data = await requestsAPI.getMyRequests(params);
            set({
                requests: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch requests',
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
                error: error.message || 'Failed to fetch request',
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
            const errorMessage = error.message || 'Failed to create request';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Update request status
    updateRequestStatus: async (id, status, feedback = null) => {
        set({ isLoading: true, error: null });
        try {
            const data = await requestsAPI.updateRequestStatus(id, status, feedback);
            set((state) => ({
                requests: state.requests.map((req) =>
                    req.id === id ? data.data : req
                ),
                currentRequest: state.currentRequest?.id === id ? data.data : state.currentRequest,
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.message || 'Failed to update request status';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Cancel request
    cancelRequest: async (id, reason) => {
        set({ isLoading: true, error: null });
        try {
            const data = await requestsAPI.cancelRequest(id, reason);
            set((state) => ({
                requests: state.requests.map((req) =>
                    req.id === id ? data.data : req
                ),
                currentRequest: state.currentRequest?.id === id ? data.data : state.currentRequest,
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.message || 'Failed to cancel request';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Submit feedback
    submitFeedback: async (id, feedback, requestRevision = false) => {
        set({ isLoading: true, error: null });
        try {
            const data = await requestsAPI.submitFeedback(id, feedback);
            set((state) => ({
                currentRequest: data.data,
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.message || 'Failed to submit feedback';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Approve request
    approveRequest: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const data = await requestsAPI.approveRequest(id);
            set((state) => ({
                currentRequest: data.data,
                requests: state.requests.map((req) =>
                    req.id === id ? data.data : req
                ),
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.message || 'Failed to approve request';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Get request activity timeline
    fetchRequestActivity: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const data = await requestsAPI.getRequestActivity(id);
            set({
                requestActivity: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch activity',
                isLoading: false,
            });
        }
    },

    // Change priority
    changePriority: async (id, priority) => {
        set({ isLoading: true, error: null });
        try {
            const data = await requestsAPI.changePriority(id, priority);
            set((state) => ({
                currentRequest: data.data,
                requests: state.requests.map((req) =>
                    req.id === id ? data.data : req
                ),
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.message || 'Failed to change priority';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Upload files
    uploadFiles: async (id, files) => {
        set({ isLoading: true, error: null });
        try {
            const data = await requestsAPI.uploadFiles(id, files);
            return { success: true, data: data.data };
        } catch (error) {
            const errorMessage = error.message || 'Failed to upload files';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Clear current request
    clearCurrentRequest: () => set({ currentRequest: null, requestActivity: [] }),
}));

export default useRequestStore;
