import { create } from 'zustand';
import { messageAPI } from '../api/messages';

const useMessageStore = create((set, get) => ({
    messages: [],
    unreadCount: 0,
    typingUsers: {}, // requestId -> [userIds]
    isLoading: false,
    error: null,

    // Fetch messages for a request
    fetchMessages: async (requestId) => {
        set({ isLoading: true, error: null });
        try {
            const data = await messageAPI.getRequestMessages(requestId);
            set({
                messages: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch messages',
                isLoading: false,
            });
        }
    },

    // Send a message
    sendMessage: async (messageData) => {
        try {
            const data = await messageAPI.sendMessage(messageData);
            set((state) => ({
                messages: [data.data, ...state.messages]
            }));
            return { success: true, data: data.data };
        } catch (error) {
            console.error('Failed to send message:', error);
            return { success: false, error: error.message };
        }
    },

    // Add a message (from socket)
    addMessage: (message) => {
        const { messages } = get();
        // Avoid duplicates
        if (messages.some(m => m.id === message.id)) return;

        set((state) => ({
            messages: [message, ...state.messages]
        }));
    },

    // Handle typing indicator
    setTyping: (requestId, userId, isTyping) => {
        set((state) => {
            const currentTyping = state.typingUsers[requestId] || [];
            let newTyping;

            if (isTyping) {
                if (currentTyping.includes(userId)) return state;
                newTyping = [...currentTyping, userId];
            } else {
                newTyping = currentTyping.filter(id => id !== userId);
            }

            return {
                typingUsers: {
                    ...state.typingUsers,
                    [requestId]: newTyping
                }
            };
        });
    },

    // Mark messages as read
    markAsRead: async (requestId) => {
        try {
            await messageAPI.markAsRead(requestId);
            set((state) => ({
                messages: state.messages.map(m => ({ ...m, isRead: true }))
            }));
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    },

    // Clear messages
    clearMessages: () => set({ messages: [], typingUsers: {} }),
}));

export default useMessageStore;
