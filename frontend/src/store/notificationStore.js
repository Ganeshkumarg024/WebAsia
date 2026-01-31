import { create } from 'zustand';
import { notificationsAPI } from '../api/notifications';

const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    preferences: null,

    // Fetch notifications
    fetchNotifications: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const data = await notificationsAPI.getNotifications(params);
            set({
                notifications: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.error?.message || 'Failed to fetch notifications',
                isLoading: false,
            });
        }
    },

    // Fetch unread count
    fetchUnreadCount: async () => {
        try {
            const data = await notificationsAPI.getUnreadCount();
            set({ unreadCount: data.data.count });
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    },

    // Mark as read
    markAsRead: async (id) => {
        try {
            await notificationsAPI.markAsRead(id);
            set((state) => ({
                notifications: state.notifications.map((notif) =>
                    notif.id === id ? { ...notif, read: true } : notif
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        try {
            await notificationsAPI.markAllAsRead();
            set((state) => ({
                notifications: state.notifications.map((notif) => ({
                    ...notif,
                    read: true,
                })),
                unreadCount: 0,
            }));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    },

    // Delete notification
    deleteNotification: async (id) => {
        try {
            await notificationsAPI.deleteNotification(id);
            set((state) => ({
                notifications: state.notifications.filter((notif) => notif.id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    },

    // Delete all notifications
    deleteAll: async () => {
        try {
            await notificationsAPI.deleteAll();
            set({
                notifications: [],
                unreadCount: 0,
            });
        } catch (error) {
            console.error('Failed to delete all notifications:', error);
        }
    },

    // Add notification (for real-time updates)
    addNotification: (notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }));
    },

    // Fetch preferences
    fetchPreferences: async () => {
        try {
            const data = await notificationsAPI.getPreferences();
            set({ preferences: data.data });
        } catch (error) {
            console.error('Failed to fetch preferences:', error);
        }
    },

    // Update preferences
    updatePreferences: async (preferences) => {
        set({ isLoading: true, error: null });
        try {
            const data = await notificationsAPI.updatePreferences(preferences);
            set({
                preferences: data.data,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to update preferences';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useNotificationStore;
