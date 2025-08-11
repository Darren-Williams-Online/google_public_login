const express = require('express');
const path = require('path');
const webpush = require('web-push');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables from .env file

// Import push notification routes
const pushRoutes = require('./routes/push');

const app = express();
const port = 3000;

// --- VAPID Keys from Environment Variables ---
// This is the secure, recommended way to handle keys.
// It prevents copy-paste errors and keeps secrets out of the code.
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

// CRITICAL: Check if VAPID keys are loaded correctly
if (!publicVapidKey || !privateVapidKey) {
    console.error('FATAL ERROR: VAPID keys not found. Please check your .env file.');
    process.exit(1); // Stop the server if keys are missing
}

// Set VAPID details for web-push
webpush.setVapidDetails(
  'mailto:your-email@example.com', // Replace with your email
  publicVapidKey,
  privateVapidKey
);

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Set headers for FedCM and to prevent caching
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

// Serve static files (push.html, client.js, etc.)
app.use(express.static(path.join(__dirname)));

// Use push notification routes (db.json as database)

// Endpoint to expose the public VAPID key to the client
app.get('/vapidPublicKey', (req, res) => {
  res.type('text/plain').send(publicVapidKey);
});

app.use('/', pushRoutes);

app.listen(port, () => {
  console.log(`✅ Server with push notification endpoints running at http://localhost:${port}`);
});
