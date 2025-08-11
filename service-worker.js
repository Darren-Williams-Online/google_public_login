// Service Worker Version: 4
const SW_VERSION = 4;
// Force new service worker to take control and reload all clients for updated notification format
self.addEventListener('install', function(event) {
    self.skipWaiting(); // Activate worker immediately
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim()); // Become available to all pages
    // Reload all open clients to ensure new SW is used
    self.clients.matchAll({ type: 'window' }).then(function(clientList) {
        clientList.forEach(function(client) {
            client.navigate(client.url);
        });
    });
});
console.log('Service Worker loaded.');

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    let data = {};
    try {
        data = event.data ? JSON.parse(event.data.text()) : {};
    } catch (e) {
        console.warn('Push event data was not valid JSON:', e);
        data = { title: 'Push Notification', body: event.data ? event.data.text() : 'Yay, it works!' };
    }
    console.log('[Service Worker] Notification payload:', data);
    if (data.version) {
        console.log('[Service Worker] Version:', data.version);
    }
    if (data.url) {
        console.log('[Service Worker] URL:', data.url);
    }
    const title = data.title || 'Push Notification';
    const options = {
        body: data.body || 'Yay, it works!',
        icon: data.icon || 'icon.png',
        image: data.image,
        badge: data.badge || 'badge.png',
        tag: data.tag,
        actions: data.actions,
        vibrate: data.vibrate,
        timestamp: data.timestamp,
        requireInteraction: data.requireInteraction,
        renotify: data.renotify,
        silent: data.silent,
        data: { url: data.url, version: data.version }
    };
    // Troubleshooting logs
    if (data.icon) {
        console.log('[Service Worker] Icon URL:', data.icon);
    } else {
        console.warn('[Service Worker] No icon provided, using default.');
    }
    if (data.image) {
        console.log('[Service Worker] Image URL:', data.image);
    } else {
        console.warn('[Service Worker] No image provided.');
    }
    // Try to fetch the image to check accessibility
    if (data.image) {
        fetch(data.image).then(resp => {
            console.log('[Service Worker] Image fetch status:', resp.status, resp.statusText);
        }).catch(err => {
            console.error('[Service Worker] Error fetching image:', err);
        });
    }
    if (data.icon) {
        fetch(data.icon).then(resp => {
            console.log('[Service Worker] Icon fetch status:', resp.status, resp.statusText);
        }).catch(err => {
            console.error('[Service Worker] Error fetching icon:', err);
        });
    }
    console.log('[Service Worker] Notification options:', options);
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();
    var url = (event.notification.data && event.notification.data.url) ? event.notification.data.url : null;
    var version = (event.notification.data && event.notification.data.version) ? event.notification.data.version : 'unknown';
    console.log('[Service Worker] Notification click. Version:', version, 'URL:', url);
    event.waitUntil(
        (async function() {
            if (url) {
                // Always open the provided URL in a new tab
                return self.clients.openWindow(url);
            } else {
                // Fallback to focusing or opening the root
                const clientList = await self.clients.matchAll({ type: "window" });
                for (var i = 0; i < clientList.length; i++) {
                    var client = clientList[i];
                    if (client.url === '/' && 'focus' in client)
                        return client.focus();
                }
                if (self.clients.openWindow)
                    return self.clients.openWindow('/');
            }
        })()
    );
});
