
let publicVapidKey = null;

// Fetch the public VAPID key from the server
async function getPublicVapidKey() {
    if (publicVapidKey) return publicVapidKey;
    const res = await fetch('/vapidPublicKey');
    publicVapidKey = await res.text();
    return publicVapidKey;
}

const statusMessage = document.getElementById('status-message');

// Function to convert a base64 string to a Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Main function to set up push notifications
async function setupPushNotifications() {
    if (!('serviceWorker' in navigator)) {
        statusMessage.textContent = 'Error: Service Workers are not supported by this browser.';
        return;
    }

    if (!('PushManager' in window)) {
        statusMessage.textContent = 'Error: Push Notifications are not supported by this browser.';
        return;
    }

    // Example usage: get the public VAPID key when you need it
    // const vapidKey = await getPublicVapidKey();
    // Use vapidKey for pushManager.subscribe({ applicationServerKey: ... })
}

// Unsubscribe from push notifications
async function unsubscribePushNotifications() {
    if (!('serviceWorker' in navigator)) {
        statusMessage.textContent = 'Error: Service Workers are not supported by this browser.';
        return;
    }
    try {
        const swRegistration = await navigator.serviceWorker.getRegistration();
        if (!swRegistration) {
            statusMessage.textContent = 'No service worker registration found.';
            return;
        }
        const subscription = await swRegistration.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
            // Notify the server to remove this subscription
            await fetch('/unsubscribe', {
                method: 'POST',
                body: JSON.stringify({ endpoint: subscription.endpoint }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            statusMessage.textContent = 'You have unsubscribed from push notifications.';
        } else {
            statusMessage.textContent = 'You are not currently subscribed.';
        }
    } catch (error) {
        console.error('Failed to unsubscribe:', error);
        statusMessage.textContent = `Error: ${error.message}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Always register the service worker on page load with a version query to force update
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js?v=4')
            .then(reg => {
                console.log('Service Worker registered on page load:', reg);
            })
            .catch(err => {
                console.error('Service Worker registration failed:', err);
            });
        // Auto-reload page when new service worker takes control
        navigator.serviceWorker.addEventListener('controllerchange', function() {
            console.log('New service worker activated, reloading page...');
            window.location.reload();
        });
    }
    // Call push notification setup (does not auto-subscribe)
    setupPushNotifications();
    // Attach unsubscribe event listener
    const unsubscribePushButton = document.getElementById('unsubscribe-push-button');
    if (unsubscribePushButton) {
        unsubscribePushButton.addEventListener('click', unsubscribePushNotifications);
    }
});
