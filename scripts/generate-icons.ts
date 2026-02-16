import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const appDir = path.join(process.cwd(), 'app');
const svgPath = path.join(appDir, 'icon.svg');
const svg = fs.readFileSync(svgPath);

async function generate() {
  // Generate favicon.ico (32x32 PNG embedded in ICO-like format — browsers accept PNG as .ico)
  const ico = await sharp(svg).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), ico);
  console.log('✅ favicon.ico (32x32)');

  // Generate apple-icon.png (180x180)
  const apple = await sharp(svg).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), apple);
  console.log('✅ apple-icon.png (180x180)');

  // Generate opengraph-image.png (1200x630) — dark background with centered icon
  const ogIcon = await sharp(svg).resize(400, 400).png().toBuffer();
  const ogImage = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 10, g: 10, b: 31, alpha: 1 }, // #0a0a1f
    },
  })
    .composite([{ input: ogIcon, left: 400, top: 115 }])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(appDir, 'opengraph-image.png'), ogImage);
  console.log('✅ opengraph-image.png (1200x630)');

  console.log('Done!');
}

generate();
