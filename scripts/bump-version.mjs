// Bumps the site version shown in the home page header.
// The version lives in VERSION (four numbers, e.g. 4.0.5.2). Every deployment bumps the last number.
//   node scripts/bump-version.mjs            4.0.5.2 -> 4.0.5.3
//   node scripts/bump-version.mjs --set 4.1.0.0
//   node scripts/bump-version.mjs --sync     write VERSION into the header without bumping
// It then rebuilds sw.js, since the home page changed.
// .github/workflows/version.yml runs this on every push to main.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const versionFile = join(root, 'VERSION');
const home = join(root, 'index.html');
const args = process.argv.slice(2);

let version = readFileSync(versionFile, 'utf8').trim();
if (args[0] === '--set') version = args[1];
else if (args[0] !== '--sync') {
  const parts = version.split('.').map(Number);
  parts[parts.length - 1] += 1;
  version = parts.join('.');
}
if (!/^\d+(\.\d+){3}$/.test(version || '')) {
  console.error(`Not a valid version: "${version}" (expected four numbers like 4.0.5.2)`);
  process.exit(1);
}

const html = readFileSync(home, 'utf8');
const updated = html.replace(/(data-site-version[^>]*>)v[^<]*</, `$1v${version}<`);
if (updated === html && !html.includes(`>v${version}<`)) {
  console.error('Could not find the version badge (data-site-version) in index.html');
  process.exit(1);
}
writeFileSync(versionFile, version + '\n');
writeFileSync(home, updated);

const sw = spawnSync(process.execPath, [join(root, 'scripts', 'build-sw.mjs')], { stdio: 'inherit' });
if (sw.status !== 0) process.exit(sw.status ?? 1);
console.log(`v${version}`);
