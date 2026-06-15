import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));
const dest = resolve(__dirname, '../public/version.json');

function getChangelog() {
  try {
    return readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf-8')
      .split('\n')
      .filter((l) => l.startsWith('- ') || l.startsWith('* ') || l.trim().startsWith('#'))
      .slice(0, 10)
      .join('\n')
      .trim();
  } catch {
    return '';
  }
}

const versionInfo = {
  version: pkg.version,
  buildTime: new Date().toISOString(),
  changelog: getChangelog() || '- Peningkatan performa dan perbaikan bug',
  forceUpdate: false,
  downloadUrl: '',
};

writeFileSync(dest, JSON.stringify(versionInfo, null, 2) + '\n');
console.log(`version.json generated: v${versionInfo.version} at ${versionInfo.buildTime}`);
