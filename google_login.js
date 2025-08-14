// Add global error handler to catch 403 errors
window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('403')) {
        console.error('403 Error detected:', e);
    }
});

// Add fetch error handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// Google Login Configuration and Functionality

// Configuration - Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = '590236211605-r4e76i4iru11usaka1b4ng3rfu213tr8.apps.googleusercontent.com'; // Get this from Google Cloud Console

// DOM Elements
let loginSection, profileSection, userInfoDiv, signoutBtn, manualSigninBtn;

// Add flags to prevent multiple requests
let isInitializing = false;
let isPrompting = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    loginSection = document.getElementById('login-section');
    profileSection = document.getElementById('profile-section');
    userInfoDiv = document.getElementById('user-info');
    signoutBtn = document.getElementById('signout-btn');
    manualSigninBtn = document.getElementById('manual-signin');
    
    // Log current origin for debugging
    console.log('Current origin:', window.location.origin);
    console.log('Current URL:', window.location.href);
    console.log('Protocol:', window.location.protocol);
    console.log('Host:', window.location.host);
    
    // Check for common configuration issues
    console.log('=== GOOGLE CLOUD CONSOLE CHECKLIST ===');
    console.log('1. OAuth consent screen configured?');
    console.log('2. App published or test users added?');
    console.log('3. Authorized origins include:', window.location.origin);
    console.log('4. Identity Toolkit API enabled?');
    console.log('5. Using OAuth Client ID (not Service Account)?');
    console.log('6. FedCM enabled in browser? (chrome://settings/content/federatedIdentityApi)');
    console.log('=======================================');
    
    // CRITICAL: OAuth Consent Screen Check
    console.log('🚨 OAUTH CONSENT SCREEN REQUIREMENTS:');
    console.log('1. Go to: https://console.cloud.google.com/apis/credentials/consent');
    console.log('2. Your app MUST be "Published" (not Testing)');
    console.log('3. OR add your email to "Test users" if in Testing mode');
    console.log('4. Authorized domains must include: localhost');
    console.log('5. Scopes must include: userinfo.email, userinfo.profile');
    console.log('========================================');
    
    // Additional origin debugging
    console.log('=== ORIGIN DEBUG INFO ===');
    console.log('window.location.origin:', window.location.origin);
    console.log('window.location.href:', window.location.href);
    console.log('document.domain:', document.domain);
    console.log('Alternative origins to try:');
    console.log('- http://localhost:3000');
    console.log('- http://127.0.0.1:3000');
    console.log('- http://[::1]:3000');
    console.log('========================');
    
    // Initialize Google Sign-In
    initializeGoogleSignIn();
    
    // Add event listeners
    signoutBtn.addEventListener('click', signOut);
    manualSigninBtn.addEventListener('click', manualSignIn);
    
    // Add test popup button event listener
    const testPopupBtn = document.getElementById('test-popup');
    if (testPopupBtn) {
        testPopupBtn.addEventListener('click', function() {
            console.log('Test popup button clicked');
            manualSignIn();
        });
    }
    
    // Check if user is already signed in
    checkExistingSession();
    
    // Add immediate debug check on load
    setTimeout(() => {
        console.log('=== IMMEDIATE DEBUG CHECK ===');
        console.log('Current URL for Google Cloud Console:', window.location.origin);
        console.log('Make sure this EXACT URL is in your authorized origins:', window.location.origin);
        console.log('===============================');
        window.googleLoginDebug.checkState();
    }, 1000);
});

// Initialize Google Sign-In
function initializeGoogleSignIn() {
    if (isInitializing) return; // Prevent multiple initializations
    isInitializing = true;
    
    // Wait for Google API to load
    if (typeof google !== 'undefined') {
        setupGoogleSignIn();
    } else {
        // Retry after a short delay if Google API hasn't loaded yet (max 5 retries)
        let retryCount = 0;
        const maxRetries = 5;
        
        const retryInit = () => {
            if (typeof google !== 'undefined') {
                setupGoogleSignIn();
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(retryInit, 500);
            } else {
                console.error('Google Sign-In API failed to load after multiple attempts');
                isInitializing = false;
                showManualSignInButton();
            }
        };
        
        setTimeout(retryInit, 500);
    }
}

// Setup Google Sign-In configuration
function setupGoogleSignIn() {
    try {
        console.log('Setting up Google Sign-In...');
        console.log('Client ID being used:', GOOGLE_CLIENT_ID);
        console.log('Current origin:', window.location.origin);
        console.log('Current hostname:', window.location.hostname);
        console.log('Current port:', window.location.port);
        
        // Try multiple initialization approaches for better compatibility
        const initConfigs = [
            // Primary config with FedCM
            {
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: false,
                use_fedcm_for_prompt: true
            },
            // Fallback config without FedCM
            {
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: false
            },
            // Last resort - minimal config
            {
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse
            }
        ];
        
        let initSuccess = false;
        let configUsed = 0;
        
        for (let i = 0; i < initConfigs.length && !initSuccess; i++) {
            try {
                console.log(`Trying initialization config ${i + 1}...`);
                google.accounts.id.initialize(initConfigs[i]);
                initSuccess = true;
                configUsed = i + 1;
                console.log(`Google Sign-In initialized successfully with config ${i + 1}`);
                
                if (i === 0) {
                    console.log('✅ FedCM enabled - modern browser support');
                } else if (i === 1) {
                    console.log('⚠️ FedCM disabled - fallback mode');
                } else {
                    console.log('🔧 Minimal config - basic compatibility mode');
                }
            } catch (configError) {
                console.warn(`Config ${i + 1} failed:`, configError);
                if (i === initConfigs.length - 1) {
                    throw configError; // Re-throw if last config fails
                }
            }
        }

        // Render the Sign-In button with 403 error handling
        const buttonElement = document.querySelector('.g_id_signin');
        if (buttonElement && !buttonElement.hasAttribute('data-rendered')) {
            console.log('Rendering Google Sign-In button...');
            
            try {
                google.accounts.id.renderButton(buttonElement, {
                    theme: 'outline',
                    size: 'large',
                    type: 'standard',
                    text: 'sign_in_with',
                    shape: 'rectangular',
                    logo_alignment: 'left'
                });
                buttonElement.setAttribute('data-rendered', 'true');
                console.log('Sign-in button rendered successfully');
                
                // Test if button actually works by checking for 403 errors after a delay
                setTimeout(() => {
                    const hasError = document.querySelector('iframe[src*="Failed to load"]') || 
                                   window.console.error.toString().includes('403');
                    if (hasError) {
                        console.warn('🚨 Button rendered but 403 detected - switching to alternative mode');
                        showAlternativeSignIn();
                    }
                }, 2000);
                
            } catch (renderError) {
                console.error('Button render failed:', renderError);
                showAlternativeSignIn();
            }
        }

        // Automatic One Tap prompt removed - only manual login available
        console.log('Automatic popup disabled - use manual sign-in button or Google Sign-In button');
        
        isInitializing = false;
        
    } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        
        // If it's a 403 error, provide specific guidance and immediate fixes
        if (error.message && error.message.includes('403')) {
            console.error('🚨 403 ERROR DETECTED');
            console.error('This usually means:');
            console.error('1. Origin configuration issue in Google Cloud Console');
            console.error('2. Client ID is incorrect');
            console.error('3. API propagation delay (wait 5-10 minutes)');
            console.error('4. Browser cache needs to be cleared');
            
            // Show alternative sign-in immediately
            showAlternativeSignIn();
        } else {
            // For other errors, just show manual button
            showManualSignInButton();
        }
        
        isInitializing = false;
    }
}

// Handle the credential response from Google
function handleCredentialResponse(response) {
    console.log('Credential response received');
    
    try {
        // Decode the JWT token to get user information
        const responsePayload = decodeJwtResponse(response.credential);
        
        console.log('User signed in:', responsePayload);
        
        // Store complete user data including all available fields
        const userData = {
            // Standard fields
            id: responsePayload.sub,
            email: responsePayload.email,
            name: responsePayload.name,
            picture: responsePayload.picture,
            given_name: responsePayload.given_name,
            family_name: responsePayload.family_name,
            
            // Additional fields that might be available
            locale: responsePayload.locale,
            email_verified: responsePayload.email_verified,
            hd: responsePayload.hd, // Hosted domain for G Suite users
            iss: responsePayload.iss, // Issuer
            aud: responsePayload.aud, // Audience
            iat: responsePayload.iat, // Issued at
            exp: responsePayload.exp, // Expires at
            
            // Store the complete raw response for debugging
            rawResponse: responsePayload,
            credential: response.credential
        };
        
        // Save to localStorage for session persistence
        localStorage.setItem('googleUserData', JSON.stringify(userData));
        
    // Show user profile with full data
    showUserProfile(userData);
    // Update avatar/menu in header
    if (window.onGoogleLoginSuccess) window.onGoogleLoginSuccess();
        
    } catch (error) {
        console.error('Error handling credential response:', error);
        alert('Error signing in. Please try again.');
    }
}

// Decode JWT token to get user information
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
}

// Show user profile after successful login
function showUserProfile(userData) {
    // Hide login section
    loginSection.style.display = 'none';
    
    // Show profile section
    profileSection.style.display = 'block';
    
    // Helper function to format timestamp
    function formatTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleString();
    }
    
    // Helper function to safely display value
    function safeDisplay(value) {
        if (value === undefined || value === null) return 'N/A';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        return value;
    }
    
    // Display comprehensive user information
    userInfoDiv.innerHTML = `
        <div style="text-align: left; padding: 20px; max-width: 600px; margin: 0 auto;">
            <!-- Profile Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="${userData.picture || ''}" alt="Profile Picture" 
                     style="border-radius: 50%; width: 100px; height: 100px; margin-bottom: 15px; border: 3px solid #4285f4;">
                <h3 style="color: #333; margin-bottom: 10px;">Hello, ${userData.name || 'User'}!</h3>
            </div>
            
            <!-- User Information Table -->
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="color: #4285f4; margin-bottom: 15px; text-align: center;">User Information</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #e0e0e0;">
                        <td style="padding: 8px; font-weight: bold; width: 40%;">Full Name:</td>
                        <td style="padding: 8px;">${safeDisplay(userData.name)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e0e0e0;">
                        <td style="padding: 8px; font-weight: bold;">First Name:</td>
                        <td style="padding: 8px;">${safeDisplay(userData.given_name)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e0e0e0;">
                        <td style="padding: 8px; font-weight: bold;">Last Name:</td>
                        <td style="padding: 8px;">${safeDisplay(userData.family_name)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e0e0e0;">
                        <td style="padding: 8px; font-weight: bold;">Email:</td>
                        <td style="padding: 8px;">${safeDisplay(userData.email)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e0e0e0;">
                        <td style="padding: 8px; font-weight: bold;">Email Verified:</td>
                        <td style="padding: 8px;">${safeDisplay(userData.email_verified)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e0e0e0;">
                        <td style="padding: 8px; font-weight: bold;">User ID:</td>
                        <td style="padding: 8px; font-family: monospace; font-size: 12px;">${safeDisplay(userData.id)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e0e0e0;">
                        <td style="padding: 8px; font-weight: bold;">Locale:</td>
                        <td style="padding: 8px;">${safeDisplay(userData.locale)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e0e0e0;">
                        <td style="padding: 8px; font-weight: bold;">Hosted Domain:</td>
                        <td style="padding: 8px;">${safeDisplay(userData.hd)}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Token Information -->
            <div style="background: #e8f5e8; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="color: #2e7d32; margin-bottom: 15px; text-align: center;">Token Information</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #c8e6c9;">
                        <td style="padding: 8px; font-weight: bold; width: 40%;">Issuer:</td>
                        <td style="padding: 8px; font-family: monospace; font-size: 12px;">${safeDisplay(userData.iss)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #c8e6c9;">
                        <td style="padding: 8px; font-weight: bold;">Audience:</td>
                        <td style="padding: 8px; font-family: monospace; font-size: 11px; word-break: break-all;">${safeDisplay(userData.aud)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #c8e6c9;">
                        <td style="padding: 8px; font-weight: bold;">Issued At:</td>
                        <td style="padding: 8px;">${formatTimestamp(userData.iat)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #c8e6c9;">
                        <td style="padding: 8px; font-weight: bold;">Expires At:</td>
                        <td style="padding: 8px;">${formatTimestamp(userData.exp)}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Raw Data (Collapsible) -->
            <div style="background: #fff3e0; border-radius: 8px; padding: 20px;">
                <h4 style="color: #f57c00; margin-bottom: 15px; text-align: center; cursor: pointer;" onclick="toggleRawData()">
                    📋 Raw Response Data (Click to Toggle)
                </h4>
                <div id="raw-data" style="display: none;">
                    <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto; font-size: 12px; max-height: 300px;">
${JSON.stringify(userData.rawResponse, null, 2)}</pre>
                    <div style="margin-top: 15px;">
                        <h5 style="color: #f57c00; margin-bottom: 10px;">JWT Credential Token:</h5>
                        <textarea readonly style="width: 100%; height: 100px; font-family: monospace; font-size: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">${userData.credential}</textarea>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Manual sign-in function (fallback)
function manualSignIn() {
    console.log('Manual sign-in triggered');
    console.log('Current isPrompting state:', isPrompting);
    
    if (isPrompting) {
        console.log('Already prompting, canceling existing prompt first...');
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.cancel();
        }
        isPrompting = false;
    }
    
    if (typeof google !== 'undefined') {
        // Reset any previous state that might block the popup
        google.accounts.id.disableAutoSelect();
        
        setTimeout(() => {
            isPrompting = true;
            console.log('Attempting to show manual prompt...');
            
            google.accounts.id.prompt((notification) => {
                isPrompting = false;
                console.log('Manual prompt notification:', notification);
                console.log('Manual prompt details:', {
                    isDisplayed: notification.isDisplayed(),
                    isNotDisplayed: notification.isNotDisplayed(),
                    isSkippedMoment: notification.isSkippedMoment(),
                    isDismissedMoment: notification.isDismissedMoment(),
                    getNotDisplayedReason: notification.getNotDisplayedReason(),
                    getSkippedReason: notification.getSkippedReason(),
                    getDismissedReason: notification.getDismissedReason()
                });
                
                // If still not showing, provide user feedback
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    const reason = notification.getNotDisplayedReason() || notification.getSkippedReason();
                    console.warn('Popup blocked. Reason:', reason);
                    
                    // Show user-friendly message based on reason
                    if (reason === 'suppressed_by_user') {
                        alert('Google Sign-In popup was previously dismissed. Please click the "Sign in with Google" button instead, or try refreshing the page.');
                    } else if (reason === 'unregistered_origin') {
                        alert('This domain is not authorized for Google Sign-In. Please check the Google Cloud Console configuration.');
                    } else {
                        alert('Google Sign-In popup is currently unavailable. Please use the "Sign in with Google" button instead.');
                    }
                }
            });
        }, 100);
    } else {
        alert('Google Sign-In is not available. Please refresh the page and try again.');
    }
}

// Sign out function
function signOut() {
    try {
        // Clear localStorage
        localStorage.removeItem('googleUserData');
        
        // Google Sign-Out (if available)
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }
        
        // Show login section
        loginSection.style.display = 'block';
        profileSection.style.display = 'none';
        
        // Clear user info
        userInfoDiv.innerHTML = '';
        
        console.log('User signed out successfully');
        
        // Refresh the page to reset the state
        setTimeout(() => {
            window.location.reload();
        }, 500);
        
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

// Show manual sign-in button as fallback
function showManualSignInButton() {
    manualSigninBtn.style.display = 'block';
}

// Show alternative sign-in when 403 errors occur
function showAlternativeSignIn() {
    console.log('🔧 Switching to alternative sign-in mode due to 403 errors');
    
    // Hide the problematic Google button
    const buttonElement = document.querySelector('.g_id_signin');
    if (buttonElement) {
        buttonElement.style.display = 'none';
    }
    
    // Show manual sign-in button
    showManualSignInButton();
    
    // Add a helpful message
    const loginSection = document.getElementById('login-section');
    if (loginSection && !document.getElementById('error-message')) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.cssText = `
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h4>⚠️ Configuration Issue Detected</h4>
            <p>The Google Sign-In button is experiencing a 403 error.</p>
            <p><strong>Please try:</strong></p>
            <ol style="text-align: left; margin: 10px 0;">
                <li>Wait 5-10 minutes for Google's servers to update</li>
                <li>Clear your browser cache (Ctrl+Shift+Delete)</li>
                <li>Try an incognito/private browser window</li>
                <li>Use the "Manual Sign-In" button below</li>
            </ol>
        `;
        loginSection.appendChild(errorDiv);
    }
}

// Check for existing session
function checkExistingSession() {
    const savedUserData = localStorage.getItem('googleUserData');
    if (savedUserData) {
        try {
            const userData = JSON.parse(savedUserData);
            showUserProfile(userData);
        } catch (error) {
            console.error('Error parsing saved user data:', error);
            localStorage.removeItem('googleUserData');
        }
    }
}

// Handle page visibility change (automatic prompts disabled)
document.addEventListener('visibilitychange', function() {
    // Automatic prompts disabled to prevent 403 errors
    console.log('Page visibility changed - automatic prompts disabled');
});

// Error handling for network issues
window.addEventListener('online', function() {
    if (!localStorage.getItem('googleUserData') && !isInitializing) {
        // Re-initialize when coming back online
        setTimeout(initializeGoogleSignIn, 1000);
    }
});

// Debugging helper
window.googleLoginDebug = {
    userData: () => JSON.parse(localStorage.getItem('googleUserData') || '{}'),
    signOut: signOut,
    promptLogin: manualSignIn,
    
    // Reset Google's internal state
    resetGoogleState: () => {
        console.log('Resetting Google Sign-In state...');
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            // Cancel any existing prompts
            google.accounts.id.cancel();
            // Disable auto-select to reset state
            google.accounts.id.disableAutoSelect();
            // Clear any stored dismissal state
            localStorage.removeItem('g_state');
            localStorage.removeItem('googleUserData');
            // Reset our flags
            isPrompting = false;
            isInitializing = false;
            console.log('Google state reset complete');
        }
    },
    
    // Force show popup (bypass normal restrictions)
    forcePopup: () => {
        console.log('Forcing popup display...');
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            // Reset state first
            google.accounts.id.cancel();
            google.accounts.id.disableAutoSelect();
            
            // Force re-initialization
            setTimeout(() => {
                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                    auto_select: false,
                    cancel_on_tap_outside: false
                });
                
                // Force prompt
                google.accounts.id.prompt((notification) => {
                    console.log('Forced prompt result:', notification);
                    console.log('Forced prompt details:', {
                        isDisplayed: notification.isDisplayed(),
                        isNotDisplayed: notification.isNotDisplayed(),
                        isSkippedMoment: notification.isSkippedMoment(),
                        isDismissedMoment: notification.isDismissedMoment(),
                        getNotDisplayedReason: notification.getNotDisplayedReason(),
                        getSkippedReason: notification.getSkippedReason(),
                        getDismissedReason: notification.getDismissedReason()
                    });
                });
            }, 100);
        }
    },
    
    // Check current state
    checkState: () => {
        console.log('=== CURRENT STATE ===');
        console.log('Google API loaded:', typeof google !== 'undefined');
        console.log('isInitializing:', isInitializing);
        console.log('isPrompting:', isPrompting);
        console.log('localStorage user data:', !!localStorage.getItem('googleUserData'));
        console.log('Google state storage:', localStorage.getItem('g_state'));
        console.log('Current origin:', window.location.origin);
        console.log('===================');
    },
    
    // Force clear Google's cached state that might be causing 403 errors
    clearGoogleCache: () => {
        console.log('🧹 Clearing Google cached state...');
        
        // Clear all Google-related localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('google') || key.includes('gsi') || key.includes('g_state'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log('Removed:', key);
        });
        
        // Clear sessionStorage as well
        const sessionKeysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (key.includes('google') || key.includes('gsi') || key.includes('g_state'))) {
                sessionKeysToRemove.push(key);
            }
        }
        sessionKeysToRemove.forEach(key => {
            sessionStorage.removeItem(key);
            console.log('Removed from session:', key);
        });
        
        // Reset Google API state
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.cancel();
            google.accounts.id.disableAutoSelect();
        }
        
        console.log('✅ Cache cleared. Please refresh the page and try again.');
        console.log('If issue persists, clear browser cache completely (Ctrl+Shift+Delete)');
    },
    
    // Test origin configuration
    testOrigin: () => {
        console.log('=== TESTING ORIGIN CONFIGURATION ===');
        console.log('Your current origin is:', window.location.origin);
        console.log('');
        console.log('Go to Google Cloud Console:');
        console.log('1. https://console.cloud.google.com/apis/credentials');
        console.log('2. Click on your OAuth 2.0 Client ID');
        console.log('3. In "Authorized JavaScript origins", add EXACTLY:');
        console.log('   ' + window.location.origin);
        console.log('4. Save and wait 2-3 minutes');
        console.log('=====================================');
        
        // Try to make a test request to see the exact error
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            console.log('Testing Google API call...');
            try {
                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: (response) => {
                        console.log('Test successful!', response);
                    }
                });
                console.log('Initialization test passed - checking render...');
                
                // Create a temporary test button
                const testDiv = document.createElement('div');
                testDiv.style.display = 'none';
                document.body.appendChild(testDiv);
                
                google.accounts.id.renderButton(testDiv, {
                    theme: 'outline',
                    size: 'large'
                });
                
                setTimeout(() => {
                    document.body.removeChild(testDiv);
                    console.log('Button render test completed - check console for 403 errors');
                }, 1000);
                
            } catch (error) {
                console.error('Test failed:', error);
            }
        }
    }
};

// Toggle raw data display
function toggleRawData() {
    const rawDataDiv = document.getElementById('raw-data');
    if (rawDataDiv) {
        if (rawDataDiv.style.display === 'none') {
            rawDataDiv.style.display = 'block';
        } else {
            rawDataDiv.style.display = 'none';
        }
    }
}