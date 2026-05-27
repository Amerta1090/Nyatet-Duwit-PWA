import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const sizes = [192, 512];

async function generate() {
  const svgBuffer = readFileSync(join(publicDir, 'icon.svg'));

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(publicDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  // Generate maskable icon (with padding for safe area)
  const maskableSvg = readFileSync(join(publicDir, 'icon-maskable.svg'));
  for (const size of [192, 512]) {
    const padding = Math.round(size * 0.1);
    await sharp(maskableSvg)
      .resize(size - padding * 2, size - padding * 2)
      .extend({ top: padding, bottom: padding, left: padding, right: padding, background: '#1E40AF' })
      .png()
      .toFile(join(publicDir, `icon-maskable-${size}.png`));
    console.log(`Generated icon-maskable-${size}.png`);
  }
}

generate().catch(console.error);
