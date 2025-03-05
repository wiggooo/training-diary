const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Source image path - using the jpg file
const sourceImage = path.join(__dirname, '20250305_231907.jpg');

// Output directory
const outputDir = path.join(__dirname, '..', 'public');

// Make sure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Define the sizes we need
const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 192, name: 'logo192.png' },
  { size: 512, name: 'logo512.png' }
];

// Generate icons for each size
async function generateIcons() {
  try {
    // First, read the source image and convert to PNG
    const sourceBuffer = await sharp(sourceImage)
      .resize(512, 512, { // First resize to a good base size
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 }
      })
      .png() // Convert to PNG
      .toBuffer();

    // Generate each size
    for (const { size, name } of sizes) {
      await sharp(sourceBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255 }
        })
        .toFile(path.join(outputDir, name));
      
      console.log(`Generated ${name}`);
    }

    // Generate favicon.ico (contains multiple sizes)
    const favicon32 = await sharp(sourceBuffer)
      .resize(32, 32)
      .toBuffer();

    // Use the 32x32 version as favicon.ico
    await sharp(favicon32)
      .toFile(path.join(outputDir, 'favicon.ico'));

    console.log('Generated favicon.ico');
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 