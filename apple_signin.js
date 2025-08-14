// apple_signin.js
// Basic Apple Sign In integration for web
// You must register your app with Apple and use your own client ID and redirect URI

// Loads the Apple JS SDK if not already loaded
function loadAppleSDK() {
    if (!document.getElementById('appleid-signin-sdk')) {
        const script = document.createElement('script');
        script.id = 'appleid-signin-sdk';
        script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
        script.async = true;
        document.head.appendChild(script);
    }
}

// Call this to trigger the Apple Sign In flow
function signInWithApple() {
    loadAppleSDK();
    if (window.AppleID) {
        window.AppleID.auth.init({
            clientId: 'YOUR_APPLE_CLIENT_ID', // Replace with your Apple client ID
            scope: 'name email',
            redirectURI: 'YOUR_REDIRECT_URI', // Replace with your redirect URI
            usePopup: true
        });
        window.AppleID.auth.signIn();
    } else {
        // Wait for SDK to load, then try again
        setTimeout(signInWithApple, 500);
    }
}


// Attach Apple sign-in to the button in the user icon dropdown
document.addEventListener('DOMContentLoaded', function() {
    var appleBtn = document.getElementById('apple-signin-btn');
    if (appleBtn) {
        appleBtn.addEventListener('click', signInWithApple);
    }
});

// Export for use in other scripts
window.signInWithApple = signInWithApple;
