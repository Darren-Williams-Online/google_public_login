const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Set headers to prevent caching and ensure FedCM compatibility
app.use((req, res, next) => {
  // This header is required for FedCM to work correctly
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  
  // These headers prevent the browser from caching the HTML file
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  next();
});

// Serve static files from the current directory
// The 'extensions' option will automatically look for '.html' files.
app.use(express.static(path.join(__dirname), { extensions: ['html'] }));

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
  console.log('This server now prevents caching and is fully FedCM-compliant.');
});
