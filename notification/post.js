// post.js - Handles push notification form submission for post.html

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('notification-form');
    const titleInput = document.getElementById('title-input');
    const messageInput = document.getElementById('message-input');
    const urlInput = document.getElementById('url-input');
    const iconInput = document.getElementById('icon-input');
    const imageInput = document.getElementById('image-input');
    const badgeInput = document.getElementById('badge-input');
    const tagInput = document.getElementById('tag-input');
    const actionsInput = document.getElementById('actions-input');
    const vibrateInput = document.getElementById('vibrate-input');
    const timestampInput = document.getElementById('timestamp-input');
    const requireInteractionInput = document.getElementById('require-interaction-input');
    const renotifyInput = document.getElementById('renotify-input');
    const silentInput = document.getElementById('silent-input');
    const groupSelect = document.getElementById('group-select');
    const statusEl = document.getElementById('status');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = titleInput.value;
        const message = messageInput.value;
        const url = urlInput.value;
        const icon = iconInput.value;
        const image = imageInput.value;
        const badge = badgeInput.value;
        const tag = tagInput.value;
        let actions = actionsInput.value;
        try { actions = actions ? JSON.parse(actions) : undefined; } catch (e) { actions = undefined; }
        let vibrate = vibrateInput.value;
        vibrate = vibrate ? vibrate.split(',').map(Number) : undefined;
        const timestamp = timestampInput.value ? Number(timestampInput.value) : undefined;
        const requireInteraction = requireInteractionInput.checked;
        const renotify = renotifyInput.checked;
        const silent = silentInput.checked;
        const group = groupSelect.value;
        if (!title || !message || !group) {
            statusEl.textContent = 'Please fill out all fields.';
            statusEl.style.color = 'red';
            return;
        }
        statusEl.textContent = 'Sending...';
        statusEl.style.color = 'black';
        try {
            const response = await fetch('/sendNotification', {
                method: 'POST',
                body: JSON.stringify({
                    title, message, url, icon, image, badge, tag, actions, vibrate, timestamp, requireInteraction, renotify, silent, group
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                statusEl.textContent = 'Notification sent successfully!';
                statusEl.style.color = 'green';
                form.reset();
            } else {
                const result = await response.json();
                throw new Error(result.error || 'Failed to send notification.');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.style.color = 'red';
        }
    });
});
