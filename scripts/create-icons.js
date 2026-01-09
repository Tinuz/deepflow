const fs = require('fs');
const path = require('path');

// Minimal valid 1x1 PNG in base64 (transparent pixel)
// We'll create proper icons after deployment works
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const publicDir = path.join(__dirname, '..', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write minimal PNG files
fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), minimalPNG);
fs.writeFileSync(path.join(publicDir, 'icon-512x512.png'), minimalPNG);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), minimalPNG);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), minimalPNG);

console.log('✓ Created placeholder icon files in /public');
console.log('  - icon-192x192.png');
console.log('  - icon-512x512.png');
console.log('  - apple-touch-icon.png');
console.log('  - favicon.ico');
