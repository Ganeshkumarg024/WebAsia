import { create } from 'zustand';
import supportChatAPI from '../api/supportChat';

const useSupportChatStore = create((set, get) => ({
    messages: [],
    conversations: [],
    unreadCount: 0,
    currentConversation: null,
    isLoading: false,
    error: null,

    // Send a message
    sendMessage: async (message, clientId = null) => {
        try {
            set({ isLoading: true, error: null });
            const response = await supportChatAPI.sendMessage(message, clientId);

            if (response.success) {
                // Add new message to the list
                set(state => ({
                    messages: [...state.messages, response.data],
                    isLoading: false
                }));
                return { success: true, data: response.data };
            }

            set({ isLoading: false, error: response.error?.message });
            return { success: false, error: response.error?.message };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to send message';
            set({ isLoading: false, error: errorMessage });
            return { success: false, error: errorMessage };
        }
    },

    // Fetch messages
    fetchMessages: async (clientId = null) => {
        try {
            set({ isLoading: true, error: null });
            const response = await supportChatAPI.getMessages(clientId);

            if (response.success) {
                set({ messages: response.data, isLoading: false });
                return { success: true };
            }

            set({ isLoading: false, error: response.error?.message });
            return { success: false };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to fetch messages';
            set({ isLoading: false, error: errorMessage });
            return { success: false };
        }
    },

    // Fetch conversations (admin only)
    fetchConversations: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await supportChatAPI.getConversations();

            if (response.success) {
                set({ conversations: response.data, isLoading: false });
                return { success: true };
            }

            set({ isLoading: false, error: response.error?.message });
            return { success: false };
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to fetch conversations';
            set({ isLoading: false, error: errorMessage });
            return { success: false };
        }
    },

    // Mark messages as read
    markAsRead: async (clientId) => {
        try {
            const response = await supportChatAPI.markAsRead(clientId);

            if (response.success) {
                // Update local state
                set(state => ({
                    messages: state.messages.map(msg =>
                        msg.clientId === clientId ? { ...msg, isRead: true } : msg
                    )
                }));
                // Refresh unread count
                get().fetchUnreadCount();
                return { success: true };
            }

            return { success: false };
        } catch (error) {
            return { success: false };
        }
    },

    // Fetch unread count
    fetchUnreadCount: async () => {
        try {
            const response = await supportChatAPI.getUnreadCount();

            if (response.success) {
                set({ unreadCount: response.data.unreadCount });
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    },

    // Set current conversation (for admin)
    setCurrentConversation: (clientId) => {
        set({ currentConversation: clientId });
    },

    // Clear messages
    clearMessages: () => {
        set({ messages: [], currentConversation: null });
    }
}));

export default useSupportChatStore;
