const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

// --- Database Setup for Local Testing ---
// This is a simple JSON file to act as a database for demonstration purposes.
// In a production environment, you should replace this with a proper database
// like PostgreSQL, MongoDB, or Firebase.
const dbPath = path.join(__dirname, '..', 'db.json');

// Function to read subscriptions from the JSON file
const getSubscriptions = () => {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data).subscriptions || [];
    } catch (error) {
        // If the file doesn't exist or is empty, return an empty array
        return [];
    }
};

// Function to save subscriptions to the JSON file
const saveSubscription = (newSubscription) => {
    const subscriptions = getSubscriptions();
    // Avoid adding duplicate subscriptions by endpoint
    const existing = subscriptions.find(sub => sub.subscription && sub.subscription.endpoint === newSubscription.subscription.endpoint);
    if (!existing) {
        subscriptions.push(newSubscription);
        fs.writeFileSync(dbPath, JSON.stringify({ subscriptions }, null, 2));
        console.log('New subscription saved to db.json');
    } else {
        console.log('Subscription already exists.');
    }
};

// Route to handle the subscription object from the client
router.post('/subscribe', (req, res) => {
    // req.body: { user, subscription }
    const { user, subscription } = req.body;
    console.log('POST /subscribe received:', { user, subscription });
    if (!subscription) {
        console.error('No subscription object provided.');
        return res.status(400).json({ error: 'No subscription object provided.' });
    }
    try {
        saveSubscription({ user, subscription });
        console.log('Subscription and user data saved to db.json');
        res.status(201).json({ message: 'Subscription and user data received and saved successfully.' });
    } catch (err) {
        console.error('Error saving subscription to db.json:', err);
        res.status(500).json({ error: 'Failed to save subscription to db.json.' });
    }
});

// Route to trigger a push notification to all subscribers
router.post('/sendNotification', (req, res) => {
    const subscriptions = getSubscriptions();
    if (subscriptions.length === 0) {
        return res.status(400).json({ error: 'No active subscriptions found.' });
    }

    const {
        title, message, url, group,
        icon, image, badge, tag, actions, vibrate, timestamp,
        requireInteraction, renotify, silent
    } = req.body;
    // Read notification-config.json for live icon/image
    let config = { icon: '', image: '' };
    try {
        config = JSON.parse(fs.readFileSync(path.join(__dirname, '../notification-config.json'), 'utf8'));
    } catch (e) {
        console.warn('Could not read notification-config.json, using defaults.', e);
    }
    // Add cache-busting timestamp to image/icon URLs
    const ts = Date.now();
    function addCacheBuster(url) {
        if (!url) return url;
        return url + (url.includes('?') ? '&' : '?') + 'v=' + ts;
    }
    const usedIcon = addCacheBuster(icon || config.icon || 'https://img.fairway.com/images/head_shot/michael-inkman-152707.png');
    const usedImage = addCacheBuster(image || config.image || 'https://img.fairway.com/images/logo-push.jpg');
    const usedBadge = badge || undefined;
    const usedTag = tag || undefined;
    const usedActions = actions || undefined;
    const usedVibrate = vibrate || undefined;
    const usedTimestamp = timestamp || undefined;
    const usedRequireInteraction = requireInteraction || undefined;
    const usedRenotify = renotify || undefined;
    const usedSilent = silent || undefined;
    console.log('[Push] Using icon:', usedIcon);
    console.log('[Push] Using image:', usedImage);
    const version = 'v5';
    let notificationBody = (message || 'This is a test message from the server!') + ` [${version}]`;
    if (url) {
        notificationBody += `\n${url}`;
    }
    const payload = JSON.stringify({
        title: (title || 'Server Push Notification') + ` [${version}]`,
        body: notificationBody,
        icon: usedIcon,
        image: usedImage,
        badge: usedBadge,
        tag: usedTag,
        actions: usedActions,
        vibrate: usedVibrate,
        timestamp: usedTimestamp,
        requireInteraction: usedRequireInteraction,
        renotify: usedRenotify,
        silent: usedSilent,
        url: url || undefined,
        version
    });

    // Filter subscriptions by group
    let filteredSubs;
    if (!group || group === 'All') {
        filteredSubs = subscriptions;
    } else if (group === 'region') {
        // Example: filter by region property if present in user
        filteredSubs = subscriptions.filter(subObj => subObj.user && subObj.user.region);
    } else if (group === 'lo_subscribed') {
        filteredSubs = subscriptions.filter(subObj => subObj.user && subObj.user.group === 'lo_subscribed');
    } else {
        filteredSubs = [];
    }

    if (filteredSubs.length === 0) {
        return res.status(400).json({ error: 'No subscribers found for the selected group.' });
    }

    // Send a notification to each filtered subscription
    const sendPromises = filteredSubs.map(subObj => {
        const sub = subObj.subscription || subObj; // backward compatibility
        return webpush.sendNotification(sub, payload)
            .catch(err => {
                console.error(`Error sending notification to ${sub.endpoint}:`, err);
                // If a subscription is expired or invalid, you might want to remove it here.
            });
    });

    Promise.all(sendPromises)
        .then(() => res.status(200).json({ message: `Notifications sent to group: ${group || 'All'}` }))
        .catch(err => {
            console.error('A general error occurred while sending notifications:', err);
            res.status(500).json({ error: 'Failed to send some or all notifications.' });
        });
});

// Route to handle unsubscription and remove from db.json
router.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    if (!endpoint) {
        return res.status(400).json({ error: 'No endpoint provided.' });
    }
    let subscriptions = getSubscriptions();
    const originalLength = subscriptions.length;
    subscriptions = subscriptions.filter(subObj => {
        const sub = subObj.subscription || subObj;
        return sub.endpoint !== endpoint;
    });
    fs.writeFileSync(dbPath, JSON.stringify({ subscriptions }, null, 2));
    if (subscriptions.length < originalLength) {
        res.status(200).json({ message: 'Unsubscribed and removed from db.' });
    } else {
        res.status(404).json({ message: 'Subscription not found in db.' });
    }
});

module.exports = router;
