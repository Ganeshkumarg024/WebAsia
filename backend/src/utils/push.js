import webpush from 'web-push';
import config from '../config/index.js';
import { PushSubscription } from '../models/index.js';

// Configure VAPID
if (config.vapid.publicKey && config.vapid.privateKey) {
    webpush.setVapidDetails(
        `mailto:${config.vapid.email}`,
        config.vapid.publicKey,
        config.vapid.privateKey
    );
} else {
    console.warn('⚠️  VAPID keys not configured. Push notifications will be disabled.');
}

/**
 * Send a push notification to a specific user
 * @param {string} userId - ID of the user to notify
 * @param {object} payload - Notification data (title, body, icon, url, etc.)
 */
export const sendPushNotification = async (userId, payload) => {
    try {
        const subscriptions = await PushSubscription.findAll({
            where: { userId }
        });

        if (!subscriptions || subscriptions.length === 0) {
            return;
        }

        const notificationPayload = JSON.stringify({
            title: payload.title || 'WebAsia Notification',
            body: payload.body || payload.message,
            icon: '/logo192.png', // Default icon
            data: {
                url: payload.actionUrl || '/',
                ...payload.metadata
            },
            ...payload
        });

        const sendPromises = subscriptions.map(sub => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            return webpush.sendNotification(pushConfig, notificationPayload)
                .catch(async (err) => {
                    // If subscription is expired or invalid, remove it
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        console.log(`Removing expired push subscription for user ${userId}`);
                        await sub.destroy();
                    } else {
                        console.error(`Push notification error for user ${userId}:`, err);
                    }
                });
        });

        await Promise.all(sendPromises);
    } catch (error) {
        console.error('Error in sendPushNotification:', error);
    }
};

export default webpush;
