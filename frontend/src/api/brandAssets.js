import apiClient from './client';

export const brandAssetsAPI = {
    // Get all brand assets for a client (accessible by designer assigned to request)
    getBrandAssets: async (userId) => {
        const response = await apiClient.get('/brand-assets', {
            params: { userId }
        });
        return response.data;
    },

    // Get brand assets by client ID
    getByClientId: async (clientId) => {
        const response = await apiClient.get(`/brand-assets/client/${clientId}`);
        return response.data;
    },

    // Create a new brand asset
    create: async (formData) => {
        const response = await apiClient.post('/brand-assets', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Update a brand asset
    update: async (id, data) => {
        const response = await apiClient.patch(`/brand-assets/${id}`, data);
        return response.data;
    },

    // Delete a brand asset
    delete: async (id) => {
        const response = await apiClient.delete(`/brand-assets/${id}`);
        return response.data;
    }
};

export default brandAssetsAPI;
