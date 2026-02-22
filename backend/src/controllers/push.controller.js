import { PushSubscription } from '../models/index.js';

export const subscribe = async (req, res) => {
    try {
        const { subscription, deviceType } = req.body;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_SUBSCRIPTION',
                    message: 'Invalid subscription object'
                }
            });
        }

        // Extract internal keys
        const { endpoint, keys } = subscription;
        const { p256dh, auth } = keys;

        // Upsert subscription
        const [pushSub, created] = await PushSubscription.findOrCreate({
            where: { endpoint },
            defaults: {
                userId: req.user.id,
                p256dh,
                auth,
                deviceType: deviceType || 'unknown',
                userAgent: req.headers['user-agent']
            }
        });

        if (!created) {
            await pushSub.update({
                userId: req.user.id,
                p256dh,
                auth,
                deviceType: deviceType || pushSub.deviceType,
                userAgent: req.headers['user-agent'],
                lastUsedAt: new Date()
            });
        }

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to push notifications',
            data: pushSub
        });
    } catch (error) {
        console.error('Push subscribe error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to subscribe to push notifications'
            }
        });
    }
};

export const unsubscribe = async (req, res) => {
    try {
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: 'Endpoint is required to unsubscribe'
                }
            });
        }

        await PushSubscription.destroy({
            where: {
                endpoint,
                userId: req.user.id
            }
        });

        res.json({
            success: true,
            message: 'Successfully unsubscribed from push notifications'
        });
    } catch (error) {
        console.error('Push unsubscribe error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to unsubscribe from push notifications'
            }
        });
    }
};

export const getVapidPublicKey = async (req, res) => {
    try {
        const { default: config } = await import('../config/index.js');
        res.json({
            success: true,
            data: {
                publicKey: config.vapid.publicKey
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { message: 'Failed to get VAPID key' }
        });
    }
};
