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
    return JSON.parse(data).subscriptions;
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
    if (!subscription) {
        return res.status(400).json({ error: 'No subscription object provided.' });
    }
    // Save both user and subscription
    saveSubscription({ user, subscription });
    res.status(201).json({ message: 'Subscription and user data received and saved successfully.' });
});

// Route to trigger a push notification to all subscribers
router.post('/sendNotification', (req, res) => {
    const subscriptions = getSubscriptions();
    if (subscriptions.length === 0) {
        return res.status(400).json({ error: 'No active subscriptions found.' });
    }

    const payload = JSON.stringify({
        title: 'Server Push Notification',
        body: req.body.message || 'This is a test message from the server!',
    });

    // Send a notification to each subscription
    const sendPromises = subscriptions.map(subObj => {
        const sub = subObj.subscription || subObj; // backward compatibility
        return webpush.sendNotification(sub, payload)
            .catch(err => {
                console.error(`Error sending notification to ${sub.endpoint}:`, err);
                // If a subscription is expired or invalid, you might want to remove it here.
                // For now, we'll just log the error.
            });
    });

    Promise.all(sendPromises)
        .then(() => res.status(200).json({ message: 'Notifications sent to all subscribers.' }))
        .catch(err => {
            console.error('A general error occurred while sending notifications:', err);
            res.status(500).json({ error: 'Failed to send some or all notifications.' });
        });
});

module.exports = router;
