// Static checks for the whole site. Node built-ins only, no dependencies.
// Run from the repo root: node tests/check-site.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve, extname } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const EXTERNAL_SCRIPT_HOSTS = new Set(['static.cloudflareinsights.com']); // disclosed on the homepage
const SKIP_DIRS = new Set(['.git', 'node_modules', 'tests', 'tasks']);

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

if (failures.length) {
  console.log(failures.join('\n'));
  console.log(`\n${failures.length} problem(s) across ${pages.length} pages.`);
  process.exit(1);
}
console.log(`OK: ${pages.length} pages. Local links and assets resolve, anchors exist, CSP is set, and only allowlisted hosts load code.`);
