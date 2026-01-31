import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketClient {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    // Connect to socket server
    connect(token) {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: {
                token,
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        // Connection events
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
        });

        return this.socket;
    }

    // Disconnect from socket server
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    // Subscribe to event
    on(event, callback) {
        if (!this.socket) {
            console.warn('Socket not connected. Call connect() first.');
            return;
        }

        this.socket.on(event, callback);

        // Store listener for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    // Unsubscribe from event
    off(event, callback) {
        if (!this.socket) return;

        if (callback) {
            this.socket.off(event, callback);

            // Remove from listeners
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                const index = eventListeners.indexOf(callback);
                if (index > -1) {
                    eventListeners.splice(index, 1);
                }
            }
        } else {
            // Remove all listeners for this event
            this.socket.off(event);
            this.listeners.delete(event);
        }
    }

    // Emit event
    emit(event, data) {
        if (!this.socket) {
            console.warn('Socket not connected. Call connect() first.');
            return;
        }

        this.socket.emit(event, data);
    }

    // Check if connected
    isConnected() {
        return this.socket?.connected || false;
    }

    // Get socket ID
    getId() {
        return this.socket?.id;
    }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;

// Event types for type safety
export const SOCKET_EVENTS = {
    // Notification events
    NOTIFICATION_NEW: 'notification:new',
    NOTIFICATION_READ: 'notification:read',

    // Request events
    REQUEST_CREATED: 'request:created',
    REQUEST_UPDATED: 'request:updated',
    REQUEST_STATUS_CHANGED: 'request:status_changed',
    REQUEST_ASSIGNED: 'request:assigned',
    REQUEST_COMPLETED: 'request:completed',

    // Message events
    MESSAGE_NEW: 'message:new',
    MESSAGE_TYPING: 'message:typing',

    // User events
    USER_ONLINE: 'user:online',
    USER_OFFLINE: 'user:offline',
};
