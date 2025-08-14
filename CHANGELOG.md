# CHANGELOG

All notable changes to this project will be documented in this file.

---

## August 13, 2025

### Added
- Apple Sign In integration: UI button in user dropdown, Apple JS SDK loader, and setup instructions (`APPLE_SIGNIN_SETUP.md`).
- User icon improvements: outline style, softer gray, thinner border, and white fill for a modern look.
- User avatar: If a Google user is logged in, their Google profile image replaces the user icon placeholder.
- Persistent login: On page load, checks localStorage for Google user and shows avatar if present.
- Conditional dropdown: If Google user is logged in, dropdown menu is replaced with a Logout button.
- Project hygiene: `.gitignore` for sensitive files, updated project structure in `README.md`.
- Footer and script cleanup: Ensured no stray script text appears in the HTML footer.

### Improved
- User icon dropdown placement and alignment in the header.
- Modularized all JS logic: No inline scripts in HTML, all event handlers and logic are in JS files.

### Documentation
- Created `APPLE_SIGNIN_SETUP.md` for Apple Sign In setup.
- Updated `README.md` to reflect new features and project structure.

---

For previous changes, see project commit history.
