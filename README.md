## Push Notification Fields

This project supports all major Web Push notification fields (title, body, icon, image, badge, tag, actions, vibrate, timestamp, requireInteraction, renotify, silent, url, and data).

To learn more and see a full JSON example, see [NOTIFICATION_FIELDS.md](./NOTIFICATION_FIELDS.md).
# Google Public Login & Push Notification Demo

This project demonstrates how to implement Google One Tap login and Web Push Notifications in a Node.js/Express app, with local user+subscription storage for development.

## Features
- Google One Tap login (with FedCM support)
- Web Push Notifications (VAPID, service worker)
- User and push subscription data stored in a local JSON file (`db.json`)
- Simple UI for subscribing and sending notifications

## Server Information (Local Hosting)
- The server is built with Node.js and Express.
- By default, it runs on **http://localhost:3000** and **http://127.0.0.1:3000**.
- To start the server, use:
  ```bash
  npm start
  ```
- Once running, you can access the app at:
  - [http://localhost:3000/index.html](http://localhost:3000/index.html) — Google login
  - [http://localhost:3000/push.html](http://localhost:3000/push.html) — Subscribe to push notifications
  - [http://localhost:3000/post.html](http://localhost:3000/post.html) — Send push notifications
  - [http://127.0.0.1:3000/index.html](http://127.0.0.1:3000/index.html) — (alternative local address)
  - [http://127.0.0.1:3000/push.html](http://127.0.0.1:3000/push.html)
  - [http://127.0.0.1:3000/post.html](http://127.0.0.1:3000/post.html)
- Make sure your Google Cloud Console OAuth credentials include both `http://localhost:3000` and `http://127.0.0.1:3000` as authorized origins.

## Project Structure
```
├── index.html                # Google login page
├── post.html                 # Send notification UI
├── push.html                 # Push notification subscription page
├── google_login.js           # Google login logic
├── service-worker.js         # Service worker for push
├── db.json                   # Local storage for subscriptions & users
├── package.json              # Project config
├── package-lock.json         # Lockfile for npm
├── .env                      # VAPID keys (never commit real keys)
├── post_css.css              # Styles for post.html
├── NOTIFICATION_FIELDS.md    # Docs for all push fields
├── SETUP_INSTRUCTIONS.md     # Setup guide
├── WORKING_SOLUTION.html     # Example working solution
├── google-push-notice-strategy.txt # Notes/strategy
├── notification/             # Notification JS modules
│   ├── client.js
│   ├── post.js
│   └── push.js
├── groups/                   # Group-related JS modules
│   ├── client.js
│   ├── post.js
│   └── push.js
├── routes/                   # Express routes
│   └── push.js
├── static/                   # Static assets
│   ├── favicon.ico
│   └── styles.css
├── auth/                     # (currently empty)
├── server/                   # (currently empty)
├── server.js                 # Express server
├── node_modules/             # npm dependencies
└── README.md
```

## Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Generate VAPID keys:**
   ```bash
   npx web-push generate-vapid-keys
   ```
   Copy the keys into your `.env` file:
   ```env
   PUBLIC_VAPID_KEY=...
   PRIVATE_VAPID_KEY=...
   ```
3. **Start the server:**
   ```bash
   npm start
   ```
4. **Google Cloud Setup:**
   - Create OAuth 2.0 credentials for a Web app
   - Add your local URL (e.g. `http://localhost:3000`) to Authorized JavaScript origins
   - Use the client ID in `index.html` and `google_login.js`

## Usage
- Visit `/index.html` to log in with Google
- Visit `/push.html` to subscribe to push notifications (must allow notifications)
- Visit `/post.html` to send a push notification to all subscribers

## How User Data is Collected
- After Google login, user info is saved in `localStorage`
- When subscribing, both user info and the push subscription are sent to the server
- The server stores `{ user, subscription }` pairs in `db.json`

## How to Initiate (Send) a Push Notification

1. **Subscribe to notifications:**
   - Open [http://localhost:3000/push.html](http://localhost:3000/push.html) in your browser and allow notifications when prompted.
2. **Send a notification:**
   - Open [http://localhost:3000/post.html](http://localhost:3000/post.html) in your browser.
   - Enter your message in the text box and click "Send Notification".
   - All subscribed browsers will receive the push notification.

You can repeat this process in multiple browsers or devices to test multi-user notifications.

## Notes
- `db.json` is for local testing only. In production, use a real database.
- VAPID keys and user data should be kept secure and never committed to public repos.
- This demo is for educational purposes and not production-ready as-is.

## License
MIT
