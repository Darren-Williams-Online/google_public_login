const publicVapidKey = ''; // Replace with your actual VAPID public key

const enablePushButton = document.getElementById('enable-push-button');
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

    try {
        // Register the service worker
        const swRegistration = await navigator.serviceWorker.register('./service-worker.js');
        console.log('Service Worker registered:', swRegistration);
        statusMessage.textContent = 'Service Worker registered successfully.';

        // Request permission for push notifications
        const permission = await window.Notification.requestPermission();
        statusMessage.textContent = `Notification permission status: ${permission}`;

        if (permission !== 'granted') {
            console.warn('Permission for notifications was not granted.');
            return;
        }

        // Get the push subscription
        const subscription = await swRegistration.pushManager.getSubscription();
        // Get user data from localStorage (set by Google login)
        let user = null;
        try {
            user = JSON.parse(localStorage.getItem('googleUserData'));
        } catch (e) {
            user = null;
        }

        if (subscription === null) {
            console.log('No existing subscription found. Creating a new one.');
            statusMessage.textContent = 'Creating a new push subscription...';
            const newSubscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });
            console.log('New Push Subscription:', newSubscription);
            statusMessage.textContent = 'Push subscription successful!';
            // Send subscription and user data to backend
            await fetch('/subscribe', {
                method: 'POST',
                body: JSON.stringify({ user, subscription: newSubscription }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else {
            console.log('Existing Push Subscription found:', subscription);
            statusMessage.textContent = 'You are already subscribed to push notifications.';
            // Also send the existing subscription and user data to the server in case the server restarted
            await fetch('/subscribe', {
                method: 'POST',
                body: JSON.stringify({ user, subscription }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

    } catch (error) {
        console.error('Failed to set up push notifications:', error);
        statusMessage.textContent = `Error: ${error.message}`;
    }
}

// Call the setup function automatically when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // No longer need the VAPID key check here as it's handled by the function call
    setupPushNotifications();
});

