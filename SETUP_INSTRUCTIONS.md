# Google Public Login Setup Instructions

## Prerequisites
You need to set up a Google OAuth 2.0 application to get a Client ID. Here's how:

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top
3. Click "New Project"
4. Enter a project name (e.g., "Google Public Login")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google+ API" and then "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" (unless you have a Google Workspace account)
3. Fill in the required fields:
   - App name: Your app name
   - User support email: Your email
   - Developer contact information: Your email
4. Click "Save and Continue"
5. Skip "Scopes" for now (click "Save and Continue")
6. Add test users if needed (click "Save and Continue")

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Give it a name (e.g., "Google Public Login Client")
5. Add authorized origins:
   - For local development: `http://localhost:3000` (or your port)
   - For production: your actual domain (e.g., `https://yourdomain.com`)
6. Add authorized redirect URIs (if needed):
   - For local: `http://localhost:3000`
   - For production: your domain
7. Click "Create"
8. Copy the "Client ID" (you'll need this!)

## Step 5: Update Your Code

1. Open `index.html`
2. Find the line with `data-client_id="YOUR_GOOGLE_CLIENT_ID"`
3. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID
4. Open `google_login.js`
5. Find the line `const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';`
6. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID

## Step 6: Test Your Application

1. Serve your application using a local server (not file:// protocol)
2. You can use:
   - Python: `python -m http.server 3000`
   - Node.js: `npx serve . -p 3000`
   - PHP: `php -S localhost:3000`
   - Any other local server

3. Open `http://localhost:3000` in your browser
4. You should see the Google Sign-In prompt automatically

## Features Included

✅ **Automatic Login Prompt**: Users are prompted to sign in as soon as they land on the page
✅ **One Tap Sign-In**: Google's streamlined sign-in experience
✅ **Fallback Button**: Manual sign-in button if One Tap fails
✅ **Session Persistence**: Users stay logged in across page reloads
✅ **Sign Out Functionality**: Users can sign out and the session is cleared
✅ **Responsive Design**: Works on desktop and mobile
✅ **Error Handling**: Graceful handling of network issues and API failures

## Security Notes

- Never expose your Client Secret in frontend code (we only use Client ID)
- Always serve your application over HTTPS in production
- The Client ID can be public as it's designed for frontend use
- Google handles all authentication securely

## Troubleshooting

**Problem**: "Sign-in prompt not showing"
**Solution**: Make sure you're serving from HTTP/HTTPS, not file:// protocol

**Problem**: "Unauthorized JavaScript origin"
**Solution**: Add your domain to authorized origins in Google Cloud Console

**Problem**: "Client ID not working"
**Solution**: Double-check you copied the correct Client ID and updated both files

## Production Deployment

When deploying to production:
1. Update authorized origins in Google Cloud Console with your production domain
2. Update the Client ID references in your code if using a different project
3. Ensure HTTPS is enabled
4. Test the login flow thoroughly

## Support

For issues with Google OAuth setup, refer to:
- [Google Identity Documentation](https://developers.google.com/identity/gsi/web)
- [Google Cloud Console Help](https://cloud.google.com/docs)
