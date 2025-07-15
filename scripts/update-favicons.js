const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  const inputPath = path.join(__dirname, '..', 'public', 'logo192.png');
  
  // Generate favicon.ico (16x16 and 32x32 sizes)
  const faviconBuffer = await sharp(inputPath)
    .resize(32, 32)
    .png()
    .toBuffer();
  
  // For ICO format, we'll use the PNG as is (modern browsers support PNG favicons)
  await sharp(faviconBuffer)
    .toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
  
  console.log('Generated favicon.ico');
  
  // Also create a 16x16 version for very small displays
  await sharp(inputPath)
    .resize(16, 16)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'favicon-16x16.png'));
  
  console.log('Generated favicon-16x16.png');
  
  // Create a 32x32 version
  await sharp(inputPath)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'favicon-32x32.png'));
  
  console.log('Generated favicon-32x32.png');
}

generateFavicons().catch(console.error);