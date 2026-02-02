import { create } from 'zustand';
import { authAPI } from '../api/auth';
import { initializeSocket, disconnectSocket } from '../socket';

const useAuthStore = create((set, get) => ({
    user: JSON.parse(sessionStorage.getItem('user')) || null,
    accessToken: sessionStorage.getItem('accessToken') || null,
    refreshToken: sessionStorage.getItem('refreshToken') || null,
    isAuthenticated: !!sessionStorage.getItem('accessToken') && !!sessionStorage.getItem('user'),
    isLoading: false,
    error: null,

    // Login
    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authAPI.login(credentials);
            const { user, accessToken, refreshToken } = data.data;

            // Store in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(user));
            sessionStorage.setItem('accessToken', accessToken);
            sessionStorage.setItem('refreshToken', refreshToken);

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

            // Store in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(user));
            sessionStorage.setItem('accessToken', accessToken);
            sessionStorage.setItem('refreshToken', refreshToken);

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

            // Clear sessionStorage
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');

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

            sessionStorage.setItem('user', JSON.stringify(user));
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

            sessionStorage.setItem('user', JSON.stringify(user));
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
