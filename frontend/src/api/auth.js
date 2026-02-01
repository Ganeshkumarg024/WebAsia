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

    // Google OAuth
    googleAuth: async (googleToken) => {
        const response = await apiClient.post('/auth/google', { token: googleToken });
        return response.data;
    },

    // LinkedIn OAuth
    linkedinAuth: async (linkedinCode) => {
        const response = await apiClient.post('/auth/linkedin', { code: linkedinCode });
        return response.data;
    },

    // Refresh token
    refreshToken: async (refreshToken) => {
        const response = await apiClient.post('/auth/refresh-token', { refreshToken });
        return response.data;
    },

    // Verify email
    verifyEmail: async (token) => {
        const response = await apiClient.post('/auth/verify-email', { token });
        return response.data;
    },

    // Resend verification email
    resendVerification: async (email) => {
        const response = await apiClient.post('/auth/resend-verification', { email });
        return response.data;
    },

    // Request password reset
    requestPasswordReset: async (email) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        const response = await apiClient.post('/auth/reset-password', { token, newPassword });
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    }
};

export default authAPI;
