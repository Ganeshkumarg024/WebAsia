import apiClient from './client';

export const supportChatAPI = {
    // Send a support message
    sendMessage: async (message, clientId = null) => {
        const response = await apiClient.post('/support/messages', {
            message,
            ...(clientId && { clientId }) // Only include clientId for admin replies
        });
        return response.data;
    },

    // Get support messages for current user
    getMessages: async (clientId = null) => {
        const params = clientId ? { clientId } : {};
        const response = await apiClient.get('/support/messages', { params });
        return response.data;
    },

    // Get all support conversations (admin only)
    getConversations: async () => {
        const response = await apiClient.get('/support/conversations');
        return response.data;
    },

    // Mark messages as read
    markAsRead: async (clientId) => {
        const response = await apiClient.put(`/support/messages/${clientId}/read`);
        return response.data;
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await apiClient.get('/support/unread-count');
        return response.data;
    }
};

export default supportChatAPI;
