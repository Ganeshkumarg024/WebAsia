import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class PushManager {
    constructor() {
        this.registration = null;
        this.publicVapidKey = null;
    }

    /**
     * Initialize the Push Manager
     */
    async init() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications are not supported in this browser');
            return false;
        }

        try {
            // Register service worker
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            // Fetch VAPID public key
            const response = await axios.get(`${API_URL}/push/vapid-key`);
            this.publicVapidKey = response.data.data.publicKey;

            return true;
        } catch (error) {
            console.error('PushManager init error:', error);
            return false;
        }
    }

    /**
     * Convert VAPID key to Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    /**
     * Subscribe the user to push notifications
     */
    async subscribeUser() {
        if (!this.registration || !this.publicVapidKey) {
            const initialized = await this.init();
            if (!initialized) return null;
        }

        try {
            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Permission not granted for notifications');
            }

            // Check if already subscribed
            let subscription = await this.registration.pushManager.getSubscription();

            if (!subscription) {
                // Subscribe
                subscription = await this.registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey)
                });

                // Send to backend
                await axios.post(`${API_URL}/push/subscribe`, {
                    subscription,
                    deviceType: this.getDeviceType()
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
            }

            return subscription;
        } catch (error) {
            console.error('Failed to subscribe user:', error);
            throw error;
        }
    }

    /**
     * Unsubscribe the user
     */
    async unsubscribeUser() {
        if (!this.registration) return;

        try {
            const subscription = await this.registration.pushManager.getSubscription();
            if (subscription) {
                // Send to backend first
                await axios.post(`${API_URL}/push/unsubscribe`, {
                    endpoint: subscription.endpoint
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Then unsubscribe in browser
                await subscription.unsubscribe();
            }
        } catch (error) {
            console.error('Failed to unsubscribe user:', error);
        }
    }

    /**
     * Get current device type
     */
    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    }
}

export const pushManager = new PushManager();
