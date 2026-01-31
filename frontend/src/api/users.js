import apiClient from './client';

export const usersAPI = {
    // Get current user profile
    getProfile: async () => {
        const response = await apiClient.get('/users/profile');
        return response.data;
    },

    // Update profile
    updateProfile: async (data) => {
        const response = await apiClient.put('/users/profile', data);
        return response.data;
    },

    // Change password
    changePassword: async (oldPassword, newPassword) => {
        const response = await apiClient.put('/users/change-password', {
            oldPassword,
            newPassword,
        });
        return response.data;
    },

    // Upload avatar
    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await apiClient.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete avatar
    deleteAvatar: async () => {
        const response = await apiClient.delete('/users/avatar');
        return response.data;
    },

    // Get user by ID (admin only)
    getUserById: async (id) => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },

    // Update user (admin only)
    updateUser: async (id, data) => {
        const response = await apiClient.put(`/users/${id}`, data);
        return response.data;
    },

    // Delete account
    deleteAccount: async (password) => {
        const response = await apiClient.delete('/users/account', {
            data: { password },
        });
        return response.data;
    },
};

export default usersAPI;
