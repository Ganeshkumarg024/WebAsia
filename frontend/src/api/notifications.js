import apiClient from './client';

export const notificationsAPI = {
    // Get all notifications
    getNotifications: async (params = {}) => {
        const response = await apiClient.get('/notifications', { params });
        return response.data;
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await apiClient.get('/notifications/unread-count');
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (id) => {
        const response = await apiClient.patch(`/notifications/${id}/read`);
        return response.data;
    },

    // Mark all as read
    markAllAsRead: async () => {
        const response = await apiClient.post('/notifications/read-all');
        return response.data;
    },

    // Delete notification
    deleteNotification: async (id) => {
        const response = await apiClient.delete(`/notifications/${id}`);
        return response.data;
    },

    // Delete all notifications
    deleteAll: async () => {
        const response = await apiClient.delete('/notifications');
        return response.data;
    },

    // Get notification preferences
    getPreferences: async () => {
        const response = await apiClient.get('/notifications/preferences');
        return response.data;
    },

    // Update notification preferences
    updatePreferences: async (preferences) => {
        const response = await apiClient.put('/notifications/preferences', preferences);
        return response.data;
    },
};

export default notificationsAPI;
