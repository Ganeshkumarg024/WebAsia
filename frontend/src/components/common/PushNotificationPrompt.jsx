import { useState, useEffect } from 'react';
import { pushManager } from '../../utils/PushManager';
import useAuthStore from '../../store/authStore';

const PushNotificationPrompt = () => {
    const { isAuthenticated } = useAuthStore();
    const [showPrompt, setShowPrompt] = useState(false);
    const [denied, setDenied] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        const checkPermission = async () => {
            if (!('Notification' in window)) return;

            if (Notification.permission === 'default') {
                // Check if we already asked in this session
                const dismissed = sessionStorage.getItem('push_prompt_dismissed');
                if (!dismissed) {
                    setShowPrompt(true);
                }
            } else if (Notification.permission === 'denied') {
                setDenied(true);
            }
        };

        checkPermission();
    }, [isAuthenticated]);

    const handleEnable = async () => {
        try {
            await pushManager.subscribeUser();
            setShowPrompt(false);
        } catch (error) {
            console.error('Failed to enable push notifications:', error);
        }
    };

    const handleDismiss = () => {
        sessionStorage.setItem('push_prompt_dismissed', 'true');
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-blue-100 dark:border-gray-700 max-w-sm">
                <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Enable Notifications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Get instant updates about your requests and messages even when you're away.
                        </p>
                        <div className="flex items-center space-x-3 mt-4">
                            <button
                                onClick={handleEnable}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/30"
                            >
                                Enable Now
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PushNotificationPrompt;
