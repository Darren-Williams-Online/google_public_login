console.log('Service Worker loaded.');

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'Push Notification';
    const options = {
        body: event.data.text() || 'Yay, it works!',
        icon: 'icon.png', // Optional: path to an icon image
        badge: 'badge.png' // Optional: path to a badge image
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    // This example focuses the window if it's already open
    // or opens a new one if it's not.
    event.waitUntil(
        clients.matchAll({
            type: "window"
        }).then(function(clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url == '/' && 'focus' in client)
                    return client.focus();
            }
            if (clients.openWindow)
                return clients.openWindow('/');
        })
    );
});
