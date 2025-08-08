# Google Public Login & Push Notification Demo

This project demonstrates how to implement Google One Tap login and Web Push Notifications in a Node.js/Express app, with local user+subscription storage for development.

## Features
- Google One Tap login (with FedCM support)
- Web Push Notifications (VAPID, service worker)
- User and push subscription data stored in a local JSON file (`db.json`)
- Simple UI for subscribing and sending notifications

## Project Structure
```
├── index.html           # Google login page
├── google_login.js      # Google login logic
├── push.html            # Push notification subscription page
├── client.js            # Push client logic
├── service-worker.js    # Service worker for push
├── post.html            # Send notification UI
├── server.js            # Express server
├── routes/
│   └── push.js          # Push notification routes
├── db.json              # Local storage for subscriptions & users
├── .env                 # VAPID keys (never commit real keys)
├── package.json         # Project config
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

## Notes
- `db.json` is for local testing only. In production, use a real database.
- VAPID keys and user data should be kept secure and never committed to public repos.
- This demo is for educational purposes and not production-ready as-is.

## License
MIT
