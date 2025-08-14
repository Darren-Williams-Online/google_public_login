// --- Half-circle icon menu implementation ---

function swapUserIconToAvatar(userProfile) {
    const userIcon = document.getElementById('userIcon');
    if (!userIcon) return;
    if (userProfile && userProfile.picture) {
        while (userIcon.firstChild) userIcon.removeChild(userIcon.firstChild);
        const img = document.createElement('img');
        img.src = userProfile.picture;
        img.alt = 'Google User Avatar';
        img.style.width = '32px';
        img.style.height = '32px';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        img.referrerPolicy = 'no-referrer';
        userIcon.appendChild(img);
    }
}

function renderUserMenu() {
    const menuContainer = document.getElementById('user-menu-fan');
    if (!menuContainer) return;
    menuContainer.innerHTML = '';

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
        // Fan menu items
        const items = [
            {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0v-.214c-2.162-1.241-4.49-1.843-6.912-2.083l.405 2.712A1 1 0 0 1 5.51 15.1h-.548a1 1 0 0 1-.916-.599l-1.85-3.49-.202-.003A2.014 2.014 0 0 1 0 9V7a2.02 2.02 0 0 1 1.992-2.013 75 75 0 0 0 2.483-.075c3.043-.154 6.148-.849 8.525-2.199zm1 0v11a.5.5 0 0 0 1 0v-11a.5.5 0 0 0-1 0m-1 1.35c-2.344 1.205-5.209 1.842-8 2.033v4.233q.27.015.537.036c2.568.189 5.093.744 7.463 1.993zm-9 6.215v-4.13a95 95 0 0 1-1.992.052A1.02 1.02 0 0 0 1 7v2c0 .55.448 1.002 1.006 1.009A61 61 0 0 1 4 10.065m-.657.975 1.609 3.037.01.024h.548l-.002-.014-.443-2.966a68 68 0 0 0-1.722-.082z"/></svg>`,
                tooltip: 'Get News Notifications',
                onClick: () => window.location.href = 'push.html',
                filter: 'drop-shadow(0 2px 6px #b3e0ff88)'
            },
            {
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
                tooltip: 'Interests',
                onClick: () => alert('Interests feature coming soon!'),
                filter: 'drop-shadow(0 2px 6px #fff9c488)'
            },
            // Power button LAST
            {
                icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="3.5" x2="12" y2="11"/><path d="M7.05 7.05a7 7 0 1 0 9.9 0"/></svg>`,
                tooltip: 'Sign Out',
                onClick: () => { localStorage.removeItem('googleUserData'); window.location.reload(); },
            },
        ];

        // Fan out in a quarter-circle (90deg spread, down-left from top-right)
        const radius = 80;
        const angleStart = 0; // right (0deg)
        const angleEnd = 90; // down (90deg)
        const angleStep = (angleEnd - angleStart) / (items.length - 1);
        items.forEach((item, i) => {
            const angle = angleStart + i * angleStep;
            const rad = angle * (Math.PI / 180);
            const x = -Math.cos(rad) * radius; // negative for leftward
            const y = Math.sin(rad) * radius;  // positive for downward
            const btn = document.createElement('button');
            btn.innerHTML = item.icon;
            btn.title = item.tooltip;
            btn.className = 'fan-menu-btn';
            btn.style.setProperty('--fan-x', `${x}px`);
            btn.style.setProperty('--fan-y', `${y}px`);
            btn.style.transitionDelay = `${i * 60}ms`;
            btn.addEventListener('click', item.onClick);
            menuContainer.appendChild(btn);
        });
    }
}

window.renderUserMenu = renderUserMenu;

// Call this after successful Google login to update avatar/menu
window.onGoogleLoginSuccess = function() {
    renderUserMenu();
};

document.addEventListener('DOMContentLoaded', function() {
    // Add the fan menu container if not present
    let menuContainer = document.getElementById('user-menu-fan');
    if (!menuContainer) {
        menuContainer = document.createElement('div');
        menuContainer.id = 'user-menu-fan';
        menuContainer.className = 'fan-menu-container';
        document.querySelector('.user-menu-container').appendChild(menuContainer);
    }
    renderUserMenu();

    // Toggle fan menu open/close with animation
    const userIcon = document.getElementById('userIcon');
    if (userIcon) {
        let open = false;
        userIcon.addEventListener('click', function(e) {
            open = !open;
            menuContainer.classList.toggle('open', open);
            e.stopPropagation();
        });
        document.addEventListener('click', function(e) {
            if (open && !userIcon.contains(e.target)) {
                menuContainer.classList.remove('open');
                open = false;
            }
        });
    }
});
