const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

const angularDistPath = path.join(__dirname, 'dist', 'frontend', 'browser');

const fallbackIndex = path.join(angularDistPath, 'login', 'index.html');

if (!fs.existsSync(fallbackIndex)) {
  console.error('Could not find Angular fallback index file.');
  console.error(`Expected file: ${fallbackIndex}`);
  console.error('Please run: npm run build');
  process.exit(1);
}

console.log(`Serving Angular app from: ${angularDistPath}`);
console.log(`Fallback file: ${fallbackIndex}`);

app.use(express.static(angularDistPath));

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'login', 'index.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'profile', 'index.html'));
});

app.get('/audit-logs', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'audit-logs', 'index.html'));
});

app.get(/.*/, (req, res) => {
  res.sendFile(fallbackIndex);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});