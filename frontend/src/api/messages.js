import apiClient from './client';

export const messageAPI = {
    // Get messages for a request
    getRequestMessages: (requestId, params = {}) => {
        return apiClient.get(`/messages/request/${requestId}`, { params });
    },

    // Send a message
    sendMessage: (messageData) => {
        return apiClient.post('/messages', messageData);
    },

    // Mark messages as read
    markAsRead: (requestId) => {
        return apiClient.post(`/messages/request/${requestId}/read`);
    },

    // Get unread count
    getUnreadCount: () => {
        return apiClient.get('/messages/unread-count');
    }
};
