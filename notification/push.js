// push.js - Handles push notification subscription and UI for push.html

document.addEventListener('DOMContentLoaded', function() {
    var clearBtn = document.getElementById('clear-status-button');
    var statusMsg = document.getElementById('status-message');
    if (clearBtn && statusMsg) {
        clearBtn.addEventListener('click', function() {
            statusMsg.textContent = '';
        });
    }
    // Follow Me button logic
    var followBtn = document.getElementById('follow-me-button');
    if (followBtn) {
        followBtn.addEventListener('click', async function() {
            statusMsg.textContent = 'Following Michael Inkman...';
            if (!('serviceWorker' in navigator)) {
                statusMsg.textContent = 'Error: Service Workers are not supported by this browser.';
                return;
            }
            try {
                let swRegistration = await navigator.serviceWorker.getRegistration();
                if (!swRegistration) {
                    // Register the service worker if not found
                    swRegistration = await navigator.serviceWorker.register('./service-worker.js?v=3');
                    if (!swRegistration) {
                        statusMsg.textContent = 'Failed to register service worker.';
                        return;
                    }
                }
                let subscription = await swRegistration.pushManager.getSubscription();
                if (!subscription) {
                    // Request permission and subscribe
                    const permission = await window.Notification.requestPermission();
                    if (permission !== 'granted') {
                        statusMsg.textContent = 'Permission for notifications was not granted.';
                        return;
                    }
                    // Use the correct VAPID key from .env and client.js
                    const publicVapidKey = 'BMWWXglCDeFgfjirAZ9sdcFx9pqPH8jENpPqyapac1UQkCruIVH9zo9Zj0xILv_8_gajkueGpoU66x5nltnibG0';
                    function urlBase64ToUint8Array(base64String) {
                        const padding = '='.repeat((4 - base64String.length % 4) % 4);
                        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
                        const rawData = window.atob(base64);
                        const outputArray = new Uint8Array(rawData.length);
                        for (let i = 0; i < rawData.length; ++i) {
                            outputArray[i] = rawData.charCodeAt(i);
                        }
                        return outputArray;
                    }
                    subscription = await swRegistration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                    });
                }
                // Send lo_subscribe request to server
                const user = { name: 'Michael Inkman', group: 'lo_subscribed' };
                await fetch('/subscribe', {
                    method: 'POST',
                    body: JSON.stringify({ user, subscription }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                statusMsg.textContent = 'You are now following Michael Inkman (lo_subscribed)!';
            } catch (error) {
                statusMsg.textContent = 'Error: ' + error.message;
            }
        });
    }
});
