const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create scripts directory if it doesn't exist
const scriptsDir = path.dirname(__filename);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Read the crown SVG and modify it with purple background
const svgPath = path.join(__dirname, '..', 'public', 'crown.svg');
let svgContent = fs.readFileSync(svgPath, 'utf-8');

// Replace the dark slate background with purple
svgContent = svgContent.replace('#1e293b', '#7c3aed'); // purple-600

// Generate logo192.png
sharp(Buffer.from(svgContent))
  .resize(192, 192)
  .png()
  .toFile(path.join(__dirname, '..', 'public', 'logo192.png'))
  .then(() => console.log('Generated logo192.png'))
  .catch(err => console.error('Error generating logo192.png:', err));

// Generate logo512.png
sharp(Buffer.from(svgContent))
  .resize(512, 512)
  .png()
  .toFile(path.join(__dirname, '..', 'public', 'logo512.png'))
  .then(() => console.log('Generated logo512.png'))
  .catch(err => console.error('Error generating logo512.png:', err));