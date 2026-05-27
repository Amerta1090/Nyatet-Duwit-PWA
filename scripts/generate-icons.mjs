import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');

const sizes = [192, 512];

async function generate() {
  const logoBuffer = readFileSync(join(rootDir, 'icon logo NyatetDuwit.png'));

  for (const size of sizes) {
    await sharp(logoBuffer)
      .resize(size, size)
      .png()
      .toFile(join(publicDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  // Generate maskable icon (with padding for safe area)
  for (const size of [192, 512]) {
    const padding = Math.round(size * 0.1);
    await sharp(logoBuffer)
      .resize(size - padding * 2, size - padding * 2)
      .extend({ top: padding, bottom: padding, left: padding, right: padding, background: '#1E40AF' })
      .png()
      .toFile(join(publicDir, `icon-maskable-${size}.png`));
    console.log(`Generated icon-maskable-${size}.png`);
  }

  // Generate favicon (48px)
  await sharp(logoBuffer)
    .resize(48, 48)
    .png()
    .toFile(join(publicDir, 'favicon.png'));
  console.log('Generated favicon.png');
}

generate().catch(console.error);
