// Writes sitemap.xml and robots.txt for search engines.
// Lists the home page, the sites index, every tool and every essay, with each file's last git change.
// Run from the repo root: node scripts/build-sitemap.mjs   (bump-version.mjs runs it on every release)
import { readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://iggym.github.io/';
const pages = [
  ['index.html', ''],
  ['sites/index.html', 'sites/'],
  ...readdirSync(join(root, 'tools')).filter((f) => f.endsWith('.html')).sort().map((f) => ['tools/' + f, 'tools/' + f]),
  ...readdirSync(join(root, 'articles')).filter((f) => f.endsWith('.html')).sort().map((f) => ['articles/' + f, 'articles/' + f]),
];
const today = new Date().toISOString().slice(0, 10);
function lastmod(file) {
  const r = spawnSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: root, encoding: 'utf8' });
  return (r.stdout || '').trim() || today;
}
const urls = pages.map(([file, path]) =>
  `  <url><loc>${BASE}${path}</loc><lastmod>${lastmod(file)}</lastmod></url>`).join('\n');
writeFileSync(join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}sitemap.xml\n`);
console.log(`wrote sitemap.xml (${pages.length} URLs) and robots.txt`);
