import apiClient from './client';

export const authAPI = {
    // Register new user
    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    // Login
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    // Refresh token
    refreshToken: async (refreshToken) => {
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        return response.data;
    },

    // Forgot password
    forgotPassword: async (email) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        const response = await apiClient.post('/auth/reset-password', {
            token,
            newPassword,
        });
        return response.data;
    },

    // Send verification email
    sendVerificationEmail: async () => {
        const response = await apiClient.post('/auth/send-verification');
        return response.data;
    },

    // Verify email
    verifyEmail: async (token) => {
        const response = await apiClient.post('/auth/verify-email', { token });
        return response.data;
    },
};

export default authAPI;
