import apiClient from './client';

export const testimonialsAPI = {
    // User-facing
    getPublic: async () => {
        const response = await apiClient.get('/testimonials/public');
        return response.data;
    },

    getMy: async () => {
        const response = await apiClient.get('/testimonials/my');
        return response.data;
    },

    submit: async (data) => {
        const response = await apiClient.post('/testimonials/submit', data);
        return response.data;
    },

    // Admin-facing (mounted under /api/admin)
    getAll: async (params = {}) => {
        const response = await apiClient.get('/admin/testimonials', { params });
        return response.data;
    },

    approve: async (id) => {
        const response = await apiClient.post(`/admin/testimonials/${id}/approve`);
        return response.data;
    },

    reject: async (id) => {
        const response = await apiClient.post(`/admin/testimonials/${id}/reject`);
        return response.data;
    }
};

export default testimonialsAPI;
