const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// PWA icon sizes from manifest.json
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generatePWAIcons() {
  try {
    // Path to the SVG icon
    const svgPath = path.join(__dirname, '../public/icons/icon.svg');
    const iconsDir = path.join(__dirname, '../public/icons');
    
    // Create icons directory if it doesn't exist
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    console.log('Generating PWA icons from SVG...');
    
    // Check if SVG exists
    if (!fs.existsSync(svgPath)) {
      console.error('SVG icon not found at:', svgPath);
      return;
    }
    
    // Generate icons for each size
    for (const size of iconSizes) {
      const filename = `icon-${size}x${size}.png`;
      const filepath = path.join(iconsDir, filename);
      
      try {
        // Convert SVG to PNG with specified size
        await sharp(svgPath)
          .resize(size, size)
          .png()
          .toFile(filepath);
        
        console.log(`✅ Created: ${filename}`);
      } catch (error) {
        console.error(`❌ Failed to create ${filename}:`, error.message);
        
        // Fallback: create a simple colored square with text
        const svgFallback = `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${size}" height="${size}" fill="#3b82f6"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.2}">P2P</text>
          </svg>
        `;
        
        await sharp(Buffer.from(svgFallback))
          .png()
          .toFile(filepath);
        
        console.log(`✅ Created fallback: ${filename}`);
      }
    }
    
    console.log('\n🎉 PWA icons generated successfully!');
    console.log(`📁 Icons saved to: ${iconsDir}`);
    
  } catch (error) {
    console.error('❌ Error generating PWA icons:', error);
  }
}

// Run the script
generatePWAIcons(); 