/* eslint-disable no-restricted-globals */

// Service Worker for Push Notifications
self.addEventListener('push', (event) => {
    let data = { title: 'WebAsia', body: 'New notification received' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'WebAsia', body: event.data.text() };
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/logo192.png',
        badge: '/badge.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.data?.url || '/',
            ...data.data
        },
        actions: [
            { action: 'open', title: 'View Details' },
            { action: 'close', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if there is already a window/tab open with the target URL
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window/tab
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});
