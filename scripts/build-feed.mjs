// Writes feed.xml (Atom) from articles/index.json. Node built-ins only.
// Run from the repo root: node scripts/build-feed.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://iggym.github.io/';
const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The index only gives month and year, so entries are dated the 1st of the month.
function isoDate(label) {
  const [month, year] = label.trim().split(/\s+/);
  const m = MONTHS.indexOf(month.toUpperCase());
  if (m < 0 || !/^\d{4}$/.test(year)) throw new Error(`Unrecognised date: ${label}`);
  return `${year}-${String(m + 1).padStart(2, '0')}-01T00:00:00Z`;
}

const entries = JSON.parse(readFileSync(join(root, 'articles', 'index.json'), 'utf8'));
const updated = entries.map((e) => isoDate(e.date)).sort().reverse()[0];
const items = entries.map((e) => `  <entry>
    <title>${esc(e.title)}</title>
    <link href="${SITE}${esc(e.url)}"/>
    <id>${SITE}${esc(e.url)}</id>
    <published>${isoDate(e.date)}</published>
    <updated>${isoDate(e.date)}</updated>
    <summary>${esc(e.excerpt)} (${esc(e.readTime)} read)</summary>
  </entry>`).join('\n');

const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Iggy Mwangi: writing</title>
  <subtitle>Essays on keeping AI systems working in production.</subtitle>
  <link href="${SITE}feed.xml" rel="self" type="application/atom+xml"/>
  <link href="${SITE}"/>
  <id>${SITE}</id>
  <updated>${updated}</updated>
  <author><name>Iggy Mwangi</name></author>
${items}
</feed>
`;
writeFileSync(join(root, 'feed.xml'), feed, 'utf8');
console.log(`wrote feed.xml with ${entries.length} entries`);
