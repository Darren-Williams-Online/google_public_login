// Swap user icon to Google avatar if logged in
function swapUserIconToAvatar(userProfile) {
	const userIcon = document.getElementById('userIcon');
	if (!userIcon) return;
	if (userProfile && userProfile.picture) {
		// Remove all children (SVG placeholder)
		while (userIcon.firstChild) {
			userIcon.removeChild(userIcon.firstChild);
		}
		// Create avatar image
		const img = document.createElement('img');
		img.src = userProfile.picture;
		img.alt = 'Google User Avatar';
		img.style.width = '32px';
		img.style.height = '32px';
		img.style.borderRadius = '50%';
		img.style.objectFit = 'cover';
		img.referrerPolicy = 'no-referrer';
		userIcon.appendChild(img);
	} else {
		// Optionally, restore SVG if not logged in (not required for now)
	}
}
// user_menu.js
// Handles rendering of the user dropdown menu based on login state

function renderUserMenu() {
	const userDropdown = document.getElementById('userDropdown');
	if (!userDropdown) return;
	userDropdown.innerHTML = '';

	// Check Google login state
	let userProfile = null;
	try {
		const data = localStorage.getItem('googleUserData');
		if (data) userProfile = JSON.parse(data);
	} catch (e) {}

	// Check push subscription state
	let isSubscribed = false;
	try {
		const sub = localStorage.getItem('pushSubscription');
		if (sub) {
			const obj = JSON.parse(sub);
			isSubscribed = !!obj && typeof obj === 'object';
		}
	} catch (e) {}

	if (userProfile && userProfile.picture) {
		swapUserIconToAvatar(userProfile);
		// User is logged in
		if (!isSubscribed) {
			const newsBtn = document.createElement('button');
			newsBtn.textContent = 'Get News Notifications';
			newsBtn.style.width = '100%';
			newsBtn.style.borderColor = '#1976d2';
			newsBtn.style.color = '#1976d2';
			newsBtn.style.border = '1px solid #1976d2';
			newsBtn.style.borderRadius = '6px';
			newsBtn.style.padding = '5px 0';
			newsBtn.style.fontSize = '16px';
			newsBtn.style.cursor = 'pointer';
			newsBtn.style.marginBottom = '10px';
			newsBtn.onclick = function() {
				window.location.href = 'push.html';
			};
			userDropdown.appendChild(newsBtn);
		}
		const logoutBtn = document.createElement('button');
		logoutBtn.textContent = 'Logout';
		logoutBtn.style.width = '100%';
		logoutBtn.style.background = '#fff';
		logoutBtn.style.borderColor = '#f44336';
		logoutBtn.style.color = '#f44336';
		logoutBtn.style.border = '1px solid #f44336';
		logoutBtn.style.borderRadius = '6px';
		logoutBtn.style.padding = '3px 0';
		logoutBtn.style.fontSize = '16px';
		logoutBtn.style.cursor = 'pointer';
		logoutBtn.onclick = function() {
			localStorage.removeItem('googleUserData');
			window.location.reload();
		};
	// Add horizontal rule for separation
	const hr = document.createElement('hr');
	hr.style.margin = '10px 0';
	userDropdown.appendChild(hr);
	userDropdown.appendChild(logoutBtn);
	} else {
		// User is logged out
		// Google Sign-In button (already rendered by Google API)
		// Apple Sign-In button (already present in HTML)
		// No extra logic needed, just leave the HTML as is
	}
}

// Expose for use in other scripts
window.renderUserMenu = renderUserMenu;

// Setup dropdown toggle and initial render on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
	renderUserMenu();
	const userIcon = document.getElementById('userIcon');
	const userDropdown = document.getElementById('userDropdown');
	if (userIcon && userDropdown) {
		userIcon.addEventListener('click', function(e) {
			userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
			e.stopPropagation();
		});
		userIcon.addEventListener('keydown', function(e) {
			if (e.key === 'Enter' || e.key === ' ') {
				userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
				e.preventDefault();
			}
		});
		document.addEventListener('click', function(e) {
			if (!userDropdown.contains(e.target) && e.target !== userIcon) {
				userDropdown.style.display = 'none';
			}
		});
	}
});
