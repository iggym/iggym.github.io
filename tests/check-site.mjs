// Static checks for the whole site. Node built-ins only, no dependencies.
// Run from the repo root: node tests/check-site.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, relative, resolve, extname } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const EXTERNAL_SCRIPT_HOSTS = new Set(['static.cloudflareinsights.com']); // disclosed on the homepage
const SKIP_DIRS = new Set(['.git', 'node_modules', 'tests', 'tasks', 'scripts', 'resume']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (extname(p) === '.html') out.push(p);
  }
  return out;
}

const pages = walk(ROOT);
const failures = [];
const fail = (page, msg) => failures.push(`${relative(ROOT, page)}: ${msg}`);
const tagPattern = /<(a|link|script|img|source|iframe)\b([^>]*)>/gi;
const ids = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const dir = dirname(page);

  if (!/<meta http-equiv="Content-Security-Policy"/i.test(html)) fail(page, 'missing Content-Security-Policy meta');

  for (const m of html.matchAll(tagPattern)) {
    const tag = m[1];
    const attrs = m[2];
    const ref = attrs.match(/\s(href|src)="([^"]*)"/i);
    if (!ref) continue;
    const kind = ref[1];
    const value = ref[2].trim();
    if (!value || value.startsWith('mailto:') || value.startsWith('tel:') || value.startsWith('data:')) continue;

    if (/^https?:\/\//.test(value)) {
      const host = new URL(value).host;
      const loadsCode = ['script', 'img', 'source', 'iframe'].includes(tag.toLowerCase()) ||
        (tag.toLowerCase() === 'link' && /rel="stylesheet"/i.test(attrs));
      if (loadsCode && !EXTERNAL_SCRIPT_HOSTS.has(host)) fail(page, `external <${tag}> from ${host}`);
      continue;
    }

    const [withQuery, fragment] = value.split('#');
    const pathPart = withQuery.split('?')[0]; // ignore cache-busting ?v=
    if (pathPart === '' && fragment !== undefined) {
      if (fragment && !ids(html).has(fragment)) fail(page, `broken in-page anchor #${fragment}`);
      continue;
    }
    const target = pathPart.startsWith('/') ? join(ROOT, pathPart) : join(dir, pathPart);
    const resolved = pathPart.endsWith('/') ? join(target, 'index.html') : target;
    if (!existsSync(resolved)) fail(page, `missing ${kind}="${value}"`);
    else if (fragment) {
      const targetHtml = resolved.endsWith('.html') ? readFileSync(resolved, 'utf8') : '';
      if (targetHtml && fragment && !ids(targetHtml).has(fragment)) fail(page, `broken anchor ${value}`);
    }
  }
}

// Every page needs a title, description, canonical link, share tags, and valid JSON-LD.
// 404 is deliberately noindex, so it only needs a title and description.
{
  const meta = (html, name, attr = 'name') => {
    const m = html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`, 'i'));
    return m ? m[1] : null;
  };
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    const rel = relative(ROOT, page);
    const title = html.match(/<title>([\s\S]*?)<\/title>/i);
    if (!title || !title[1].trim()) fail(page, 'missing <title>');
    if (!meta(html, 'description')) fail(page, 'missing meta description');
    if (rel === '404.html') {
      if (meta(html, 'robots') !== 'noindex') fail(page, '404 should be noindex');
      continue;
    }
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i);
    if (!canonical || !/^https:\/\//.test(canonical[1])) fail(page, 'missing absolute canonical link');
    for (const key of ['og:title', 'og:description', 'og:image']) {
      const v = meta(html, key, 'property');
      if (!v) fail(page, `missing ${key}`);
      else if (key === 'og:image' && !/^https:\/\//.test(v)) fail(page, 'og:image must be an absolute URL');
    }
    if (!meta(html, 'twitter:card')) fail(page, 'missing twitter:card');
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try { JSON.parse(m[1]); } catch { fail(page, 'JSON-LD does not parse'); }
    }
  }
}

// Offline app: manifest, icons, registration on every page, and an up-to-date service worker.
{
  for (const asset of ['manifest.webmanifest', 'sw.js', 'assets/img/icon-192.png', 'assets/img/icon-512.png']) {
    if (!existsSync(join(ROOT, asset))) fail(join(ROOT, asset), 'missing offline asset');
  }
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    if (!/<link rel="manifest" href="\/manifest\.webmanifest">/.test(html)) fail(page, 'missing web app manifest link');
    if (!/<script defer src="[^"]*assets\/js\/sw-register\.js"><\/script>/.test(html)) fail(page, 'missing service worker registration');
  }
  const check = spawnSync(process.execPath, [join(ROOT, 'scripts', 'build-sw.mjs'), '--check'], { encoding: 'utf8' });
  if (check.status !== 0) fail(join(ROOT, 'sw.js'), 'sw.js is stale; run node scripts/build-sw.mjs');
}

// Tool pages must share one header, generated from scripts/tool-shell.html.
{
  const shell = readFileSync(join(ROOT, 'scripts', 'tool-shell.html'), 'utf8').trimEnd();
  for (const page of pages.filter((p) => relative(ROOT, p).startsWith('tools' + '/'))) {
    const m = readFileSync(page, 'utf8').match(/  <header class="tool-top">[\s\S]*?<\/header>/);
    if (!m || m[0] !== shell) fail(page, 'tool header differs from scripts/tool-shell.html');
  }
}

// Cache-busting: every shared asset must use one ?v= stamp on every page, so browsers fetch it once.
{
  const stamps = new Map(); // asset path -> Set of stamps
  for (const page of pages) {
    for (const m of readFileSync(page, 'utf8').matchAll(/(?:href|src)="([^"]+?\.(?:css|js))\?v=([0-9a-z]+)"/g)) {
      const asset = m[1].replace(/^(\.\.\/|\.\/|\/)+/, '');
      if (!stamps.has(asset)) stamps.set(asset, new Set());
      stamps.get(asset).add(m[2]);
    }
  }
  for (const [asset, values] of stamps) {
    if (values.size > 1) failures.push(`${asset}: several ?v= stamps in use (${[...values].join(', ')})`);
  }
}

// Every page needs a <main> landmark and a favicon. The 404 page is included.
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const rel = relative(ROOT, page);
  if (!/<main[\s>]/i.test(html)) fail(page, 'missing <main> landmark');
  if (!/<link rel="icon"/i.test(html)) fail(page, 'missing <link rel="icon">');
  if (/<main[\s>]/i.test(html) && rel !== '404.html' && !/<main[^>]*\sid="main"/i.test(html) && !/<main[^>]*\sid='main'/i.test(html)) {
    fail(page, '<main> should have id="main" so the skip link works');
  }
}

// Heading structure: one <h1>, and no skipped levels (for example an <h2> followed by an <h4>).
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const levels = [...html.matchAll(/<h([1-6])[\s>]/gi)].map((m) => Number(m[1]));
  const h1s = levels.filter((l) => l === 1).length;
  if (h1s !== 1) fail(page, `expected exactly one <h1>, found ${h1s}`);
  let prev = 0;
  for (const level of levels) {
    if (prev && level > prev + 1) { fail(page, `heading level skips from h${prev} to h${level}`); break; }
    prev = level;
  }
}

// Parity: the tool and essay lists, the Explore menu, and the Atom feed all have to name the same pages.
{
  const toolFiles = pages.map((p) => relative(ROOT, p)).filter((r) => r.startsWith('tools/') && r !== 'tools/index.json');
  const toolIndex = JSON.parse(readFileSync(join(ROOT, 'tools', 'index.json'), 'utf8')).map((t) => t.url);
  const toolPages = toolFiles.filter((f) => f !== 'tools/index.html');
  const siteMap = readFileSync(join(ROOT, 'assets', 'js', 'site-map.js'), 'utf8');
  const menuTools = [...siteMap.matchAll(/href: "(tools\/[^"]+\.html)"/g)].map((m) => m[1]);
  const compare = (label, a, b) => {
    const sa = new Set(a), sb = new Set(b);
    for (const x of sa) if (!sb.has(x)) failures.push(`${label}: ${x} is missing from the other list`);
    for (const x of sb) if (!sa.has(x)) failures.push(`${label}: ${x} is not a page in the repo`);
  };
  compare('tools/index.json vs tools/*.html', toolIndex, toolPages);
  compare('assets/js/site-map.js vs tools/*.html', menuTools, toolPages);

  const articlePages = pages.map((p) => relative(ROOT, p)).filter((r) => r.startsWith('articles/'));
  const articleIndex = JSON.parse(readFileSync(join(ROOT, 'articles', 'index.json'), 'utf8')).map((a) => a.url);
  compare('articles/index.json vs articles/*.html', articleIndex, articlePages);

  const feed = readFileSync(join(ROOT, 'feed.xml'), 'utf8');
  for (const url of articleIndex) {
    if (!feed.includes(`https://iggym.github.io/${url}`)) failures.push(`feed.xml: missing entry for ${url}`);
  }
}

// Sitemap and robots.txt must match the pages. Regenerate with node scripts/build-sitemap.mjs.
{
  const check = spawnSync(process.execPath, [join(ROOT, 'scripts', 'build-sitemap.mjs'), '--check'], { encoding: 'utf8' });
  if (check.status !== 0) fail(join(ROOT, 'sitemap.xml'), 'sitemap.xml or robots.txt is stale; run node scripts/build-sitemap.mjs');
}

if (failures.length) {
  console.log(failures.join('\n'));
  console.log(`\n${failures.length} problem(s) across ${pages.length} pages.`);
  process.exit(1);
}
console.log(`OK: ${pages.length} pages. Local links and assets resolve, anchors exist, CSP is set, and only allowlisted hosts load code.`);
