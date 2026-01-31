import socketClient, { SOCKET_EVENTS } from './client';
import useNotificationStore from '../store/notificationStore';
import useRequestStore from '../store/requestStore';

// Initialize socket connection with auth token
export const initializeSocket = (token) => {
    socketClient.connect(token);
    setupSocketListeners();
};

// Setup all socket event listeners
const setupSocketListeners = () => {
    // Notification events
    socketClient.on(SOCKET_EVENTS.NOTIFICATION_NEW, (notification) => {
        const { addNotification } = useNotificationStore.getState();
        addNotification(notification);

        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/assets/mascot.png',
            });
        }
    });

    // Request events
    socketClient.on(SOCKET_EVENTS.REQUEST_UPDATED, (request) => {
        const { requests, currentRequest } = useRequestStore.getState();

        // Update request in list
        useRequestStore.setState({
            requests: requests.map((req) =>
                req.id === request.id ? request : req
            ),
            currentRequest: currentRequest?.id === request.id ? request : currentRequest,
        });
    });

    socketClient.on(SOCKET_EVENTS.REQUEST_STATUS_CHANGED, (data) => {
        const { requests, currentRequest } = useRequestStore.getState();

        // Update request status
        useRequestStore.setState({
            requests: requests.map((req) =>
                req.id === data.requestId ? { ...req, status: data.status } : req
            ),
            currentRequest: currentRequest?.id === data.requestId
                ? { ...currentRequest, status: data.status }
                : currentRequest,
        });
    });

    socketClient.on(SOCKET_EVENTS.REQUEST_ASSIGNED, (data) => {
        console.log('Request assigned:', data);
        // Refresh requests if needed
    });

    socketClient.on(SOCKET_EVENTS.REQUEST_COMPLETED, (data) => {
        console.log('Request completed:', data);
        // Show completion notification
    });
};

// Disconnect socket
export const disconnectSocket = () => {
    socketClient.disconnect();
};

// Request browser notification permission
export const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return Notification.permission === 'granted';
};

export default socketClient;
