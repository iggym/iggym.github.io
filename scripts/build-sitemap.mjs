// Writes sitemap.xml and robots.txt from the HTML pages that are meant to be indexed.
// Skips noindex pages and anything the Pages build excludes (see _config.yml).
// Run from the repo root: node scripts/build-sitemap.mjs
// Check only (fails if the files are stale): node scripts/build-sitemap.mjs --check
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SITE = 'https://iggym.github.io/';
const SKIP = new Set(['.git', 'node_modules', 'tests', 'tasks', 'scripts', 'resume', 'archive']);

export function indexablePages(root = ROOT) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (SKIP.has(name) || name.startsWith('.')) continue;
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (extname(p) === '.html') {
        const html = readFileSync(p, 'utf8');
        if (/<meta name="robots" content="noindex"/i.test(html)) continue;
        out.push(relative(root, p).split('\\').join('/'));
      }
    }
  };
  walk(root);
  return out.sort();
}

// Pages are served at their path, and a folder's index.html is served at the folder URL.
export const urlFor = (rel) => SITE + rel.replace(/(^|\/)index\.html$/, '$1');

export function buildSitemap(pages) {
  const urls = pages.map((p) => `  <url>\n    <loc>${urlFor(p)}</loc>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const ROBOTS = `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`;

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const pages = indexablePages();
  const sitemap = buildSitemap(pages);
  if (process.argv.includes('--check')) {
    const current = (f) => { try { return readFileSync(join(ROOT, f), 'utf8'); } catch { return null; } };
    if (current('sitemap.xml') !== sitemap || current('robots.txt') !== ROBOTS) {
      console.log('sitemap.xml or robots.txt is stale; run node scripts/build-sitemap.mjs');
      process.exit(1);
    }
    console.log(`OK: sitemap lists ${pages.length} pages.`);
  } else {
    writeFileSync(join(ROOT, 'sitemap.xml'), sitemap);
    writeFileSync(join(ROOT, 'robots.txt'), ROBOTS);
    console.log(`Wrote sitemap.xml (${pages.length} pages) and robots.txt.`);
  }
}
