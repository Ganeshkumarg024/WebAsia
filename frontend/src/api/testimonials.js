import apiClient from './client';

export const testimonialsAPI = {
    // Get all testimonials
    getAll: async (params = {}) => {
        const response = await apiClient.get('/testimonials', { params });
        return response.data;
    },

    // Get pending testimonials (admin)
    getPending: async () => {
        const response = await apiClient.get('/admin/testimonials/pending');
        return response.data;
    },

    // Approve testimonial (admin)
    approve: async (id) => {
        const response = await apiClient.post(`/admin/testimonials/${id}/approve`);
        return response.data;
    },

    // Reject testimonial (admin)
    reject: async (id, reason) => {
        const response = await apiClient.post(`/admin/testimonials/${id}/reject`, { reason });
        return response.data;
    },

    // Update testimonial (admin)
    update: async (id, data) => {
        const response = await apiClient.put(`/admin/testimonials/${id}`, data);
        return response.data;
    },

    // Toggle featured status (admin)
    toggleFeatured: async (id) => {
        const response = await apiClient.post(`/admin/testimonials/${id}/toggle-featured`);
        return response.data;
    },
};

export default testimonialsAPI;
