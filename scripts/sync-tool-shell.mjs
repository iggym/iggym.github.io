// Copies scripts/tool-shell.html into the <header class="tool-top"> of every tool page.
// Run from the repo root: node scripts/sync-tool-shell.mjs          (write)
//                          node scripts/sync-tool-shell.mjs --check (fail if any page differs)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shell = readFileSync(join(root, 'scripts', 'tool-shell.html'), 'utf8').trimEnd();
const headerPattern = /  <header class="tool-top">[\s\S]*?<\/header>/;
const check = process.argv.includes('--check');
const stale = [];

for (const name of readdirSync(join(root, 'tools')).filter((f) => f.endsWith('.html'))) {
  const file = join(root, 'tools', name);
  const html = readFileSync(file, 'utf8');
  if (!headerPattern.test(html)) throw new Error(`No tool header found in tools/${name}`);
  const next = html.replace(headerPattern, shell);
  if (next !== html) {
    if (check) stale.push(`tools/${name}`);
    else writeFileSync(file, next, 'utf8');
  }
}

if (check && stale.length) {
  console.error(`Header differs from scripts/tool-shell.html: ${stale.join(', ')}`);
  console.error('Run: node scripts/sync-tool-shell.mjs');
  process.exit(1);
}
console.log(check ? 'Tool headers match the shell.' : 'Tool headers written from the shell.');
