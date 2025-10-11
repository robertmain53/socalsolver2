#!/usr/bin/env node

/**
 * Generate favicons and app icons from the logo
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '../public/socal.png');
const publicDir = path.join(__dirname, '../public');
const appDir = path.join(__dirname, '../app');

// Icon sizes to generate
const sizes = [
  { name: 'favicon.ico', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 }
];

console.log('🎨 Generating favicons and app icons from logo...\n');

try {
  // Check if logo exists
  await fs.access(logoPath);

  // Generate each size
  for (const { name, size } of sizes) {
    const outputPath = path.join(publicDir, name);

    if (name.endsWith('.ico')) {
      // For ICO files, generate PNG first then convert
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath.replace('.ico', '.png'));

      console.log(`✅ Generated ${name.replace('.ico', '.png')} (${size}x${size})`);
    } else {
      // Generate PNG
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${name} (${size}x${size})`);
    }
  }

  // Generate opengraph image (1200x630 for social media)
  const ogImagePath = path.join(publicDir, 'og-image.png');
  await sharp(logoPath)
    .resize(1200, 630, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(ogImagePath);

  console.log(`✅ Generated og-image.png (1200x630)`);

  // Generate site.webmanifest
  const manifest = {
    name: 'SoCalSolver',
    short_name: 'SoCalSolver',
    description: 'Italian Financial Calculators - Tax, Mortgage, VAT & More',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/'
  };

  await fs.writeFile(
    path.join(publicDir, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`✅ Generated site.webmanifest`);

  // Generate browserconfig.xml for Windows tiles
  const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/icon-192.png"/>
      <TileColor>#ffffff</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;

  await fs.writeFile(
    path.join(publicDir, 'browserconfig.xml'),
    browserConfig
  );

  console.log(`✅ Generated browserconfig.xml`);

  console.log('\n✨ All icons generated successfully!\n');
  console.log('Next steps:');
  console.log('1. Add the following to your app/layout.tsx <head>:');
  console.log('');
  console.log('   <link rel="icon" href="/favicon.ico" sizes="any" />');
  console.log('   <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />');
  console.log('   <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />');
  console.log('   <link rel="apple-touch-icon" href="/apple-touch-icon.png" />');
  console.log('   <link rel="manifest" href="/site.webmanifest" />');
  console.log('');

} catch (error) {
  console.error('❌ Error generating icons:', error.message);
  process.exit(1);
}
