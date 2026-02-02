import { create } from 'zustand';
import { authAPI } from '../api/auth';
import { initializeSocket, disconnectSocket } from '../socket';

const useAuthStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken') && !!localStorage.getItem('user'),
    isLoading: false,
    error: null,

    // Login
    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authAPI.login(credentials);
            const { user, accessToken, refreshToken } = data.data;

            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            set({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
            });

            // Initialize socket connection
            initializeSocket(accessToken);

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Login failed';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Register
    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authAPI.register(userData);
            const { user, accessToken, refreshToken } = data.data;

            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            set({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
            });

            // Initialize socket connection
            initializeSocket(accessToken);

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Registration failed';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Logout
    logout: async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Disconnect socket
            disconnectSocket();

            // Clear localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
            });
        }
    },

    // Refresh user data
    refreshUser: async () => {
        try {
            const data = await authAPI.getCurrentUser();
            const user = data.data;

            localStorage.setItem('user', JSON.stringify(user));
            set({ user });
        } catch (error) {
            console.error('Refresh user error:', error);
        }
    },

    // Update Profile
    updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authAPI.updateProfile(profileData);
            const user = data.data; // Assuming backend returns updated user object

            localStorage.setItem('user', JSON.stringify(user));
            set({ user, isLoading: false });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to update profile';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Change Password
    changePassword: async (passwordData) => {
        set({ isLoading: true, error: null });
        try {
            await authAPI.changePassword(passwordData);
            set({ isLoading: false });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to change password';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useAuthStore;
