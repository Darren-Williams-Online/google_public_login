# Apple Sign In Setup Instructions

To enable "Sign in with Apple" in this project, follow these steps:

## 1. Register Your App with Apple
- Go to the [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list).
- Create a new Service ID for your web app.
- Configure the Service ID with your domain and redirect URI.
- Enable "Sign in with Apple" for the Service ID.

## 2. Configure Redirect URI
- The redirect URI must be HTTPS and match what you set in the Apple Developer Portal.
- Example: `https://yourdomain.com/apple-callback`

## 3. Update Credentials in Code
- In `apple_signin.js`, replace the following placeholders:
  - `YOUR_APPLE_CLIENT_ID` with your Service ID (e.g., `com.example.web`)
  - `YOUR_REDIRECT_URI` with your actual redirect URI

## 4. Add the Apple JS SDK (already included)
- The project already loads the Apple JS SDK dynamically in `apple_signin.js`.

## 5. Test the Integration
- Click the "Sign in with Apple" button in the user icon dropdown.
- You should see the Apple authentication popup.
- On success, Apple will redirect to your specified URI with an authorization code.

## 6. Backend Token Exchange (Required for Production)
- You must exchange the authorization code for tokens on your backend using your Apple private key.
- See the [Apple Sign In documentation](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/incorporating_sign_in_with_apple_into_other_platforms) for details.

---

**Note:**
- Apple requires HTTPS for all production sign-in flows.
- You must be enrolled in the Apple Developer Program to use this feature in production.
