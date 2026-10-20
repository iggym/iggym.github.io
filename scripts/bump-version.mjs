// Bumps the site version shown in the home page header.
// The version lives in VERSION (four numbers, e.g. 4.0.5.2). Every deployment bumps the last number.
//   node scripts/bump-version.mjs            4.0.5.2 -> 4.0.5.3
//   node scripts/bump-version.mjs --set 4.1.0.0
//   node scripts/bump-version.mjs --sync     write VERSION into the header without bumping
// It also stamps every asset link (?v=...) in every page with the version, so each release busts
// browser caches once and all pages share one cache key per file. Then it rebuilds sw.js.
// Run it before every push to main (there is no CI; see tasks/README.md).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
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

// Stamp ?v= on local asset links in every page (and the tool header template).
function pages(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || ['node_modules', 'tasks', 'resume', 'tests'].includes(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) pages(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}
let stamped = 0;
for (const f of pages(root)) {
  const src = readFileSync(f, 'utf8');
  const out = src.replace(/(\.(?:css|js)\?v=)[0-9A-Za-z.]+/g, `$1${version}`);
  if (out !== src) { writeFileSync(f, out); stamped++; }
}
console.log(`stamped ?v=${version} in ${stamped} page(s)`);

const map = spawnSync(process.execPath, [join(root, 'scripts', 'build-sitemap.mjs')], { stdio: 'inherit' });
if (map.status !== 0) process.exit(map.status ?? 1);
const sw = spawnSync(process.execPath, [join(root, 'scripts', 'build-sw.mjs')], { stdio: 'inherit' });
if (sw.status !== 0) process.exit(sw.status ?? 1);
console.log(`v${version}`);
