import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));
const dest = resolve(__dirname, '../public/version.json');

const versionInfo = {
  version: pkg.version,
  buildTime: new Date().toISOString(),
};

writeFileSync(dest, JSON.stringify(versionInfo, null, 2) + '\n');
console.log(`version.json generated: v${versionInfo.version} at ${versionInfo.buildTime}`);
