import apiClient from './client';

export const brandKitAPI = {
    // Get brand kit
    getBrandKit: async () => {
        const response = await apiClient.get('/brand-kit');
        return response.data;
    },

    // Update brand kit
    updateBrandKit: async (data) => {
        const response = await apiClient.put('/brand-kit', data);
        return response.data;
    },

    // Upload logo
    uploadLogo: async (file) => {
        const formData = new FormData();
        formData.append('logo', file);

        const response = await apiClient.post('/brand-kit/logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Download assets
    downloadAssets: async () => {
        const response = await apiClient.get('/brand-kit/download', {
            responseType: 'blob'
        });
        return response.data;
    }
};

export default brandKitAPI;
