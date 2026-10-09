// Build the PDF résumé from resume.json with headless Chromium.
// Needs Playwright (dev tool only; the site itself has no dependencies).
// Usage: node build_pdf.mjs OUT.pdf [SOURCE.json]
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(process.argv[2] || 'iggy-resume.pdf');
const src = resolve(process.argv[3] || join(here, 'resume.json'));
const d = JSON.parse(readFileSync(src, 'utf8'));
const fonts = resolve(here, '..', 'assets', 'fonts');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const roles = d.roles.map((r) => {
  const items = r.items.map((i) => (i.type === 'b' ? `<li>${esc(i.text)}</li>` : `<p class="note">${esc(i.text)}</p>`));
  // Group consecutive bullets into one list.
  let html = '', open = false;
  for (const it of items) {
    const isLi = it.startsWith('<li>');
    if (isLi && !open) { html += '<ul>'; open = true; }
    if (!isLi && open) { html += '</ul>'; open = false; }
    html += it;
  }
  if (open) html += '</ul>';
  const meta = esc(r.date) + (r.location ? ` · ${esc(r.location)}` : '');
  return `<section class="role"><header><h3>${esc(r.company)}</h3><p class="title">${esc(r.title)}</p><p class="meta">${meta}</p></header>${html}</section>`;
}).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(d.name)} résumé</title>
<style>
@font-face { font-family: 'Source Sans 3'; src: url('file://${fonts}/source-sans-3-normal-400.woff2') format('woff2'); font-weight: 400; }
@font-face { font-family: 'Source Sans 3'; src: url('file://${fonts}/source-sans-3-normal-600.woff2') format('woff2'); font-weight: 600; }
@font-face { font-family: 'Source Sans 3'; src: url('file://${fonts}/source-sans-3-italic-400.woff2') format('woff2'); font-style: italic; }
@font-face { font-family: 'Fraunces'; src: url('file://${fonts}/fraunces-normal-300-700.woff2') format('woff2'); font-weight: 300 700; }
@font-face { font-family: 'DM Mono'; src: url('file://${fonts}/dm-mono-normal-500.woff2') format('woff2'); font-weight: 500; }
@page { size: Letter; margin: ${d.compact ? '0.45in 0.55in 0.5in' : '0.55in 0.6in 0.6in'}; }
* { box-sizing: border-box; }
html, body { margin: 0; color: #1a1a1f; font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; font-size: ${d.compact ? '9.4pt' : '10pt'}; line-height: ${d.compact ? '1.28' : '1.38'}; }
h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 26pt; margin: 0; letter-spacing: -0.01em; }
.headline { margin: 2px 0 4px; color: #4338ca; font-size: 11pt; font-weight: 600; }
.contact { margin: 0 0 6px; color: #5a5d66; font-size: 9.5pt; }
h2 { font-family: 'DM Mono', monospace; font-weight: 500; font-size: 8.5pt; letter-spacing: 0.12em; text-transform: uppercase; color: #4338ca; margin: 14px 0 6px; padding-bottom: 3px; border-bottom: 0.6pt solid #c9c9cf; break-after: avoid; }
p { margin: 0 0 4px; }
.focus { margin: 0; padding: 0; list-style: none; columns: 2; column-gap: 22px; }
.focus li { break-inside: avoid; margin: 0 0 3px; }
.focus b { font-weight: 600; }
.role { margin: 0 0 9px; break-inside: auto; }
.role header { break-after: avoid; }
.role h3 { font-size: 11pt; font-weight: 600; margin: 0; }
.title { font-style: italic; margin: 0; }
.meta { color: #5a5d66; font-size: 9pt; margin: 0 0 3px; }
ul { margin: 0 0 3px; padding-left: 16px; }
li { margin: 0 0 2px; padding-left: 2px; }
li::marker { color: #4338ca; }
.note { margin: 0 0 3px; }
.edu b { font-weight: 600; }
.skills p { margin: 0 0 2px; }
.earlier { margin: 0 0 4px; padding-left: 16px; columns: 2; column-gap: 22px; } .earlier li { break-inside: avoid; margin: 0 0 1px; font-size: 9.5pt; }
</style></head><body>
<h1>${esc(d.name)}</h1>
<p class="headline">${esc(d.headline)}</p>
<p class="contact">${esc(d.location)} · ${esc(d.contact.phone)} · ${esc(d.contact.email)} · ${esc(d.contact.linkedin)} · ${esc(d.contact.web)}</p>
<h2>Summary</h2>
${d.summary.map((p) => `<p>${esc(p)}</p>`).join('')}
<ul class="focus">${d.focus.map(([k, v]) => `<li><b>${esc(k)}:</b> ${esc(v)}</li>`).join('')}</ul>
<h2>Experience</h2>
${roles}
${d.earlier ? `<h2>Earlier experience</h2><ul class="earlier">${d.earlier.map((e) => `<li><b>${esc(e.company)}</b>${e.title ? ' · ' + esc(e.title) : ''} · ${esc(e.date)}</li>`).join('')}</ul>` : ''}
<h2>Education</h2>
${d.education.map((e) => `<p class="edu"><b>${esc(e.school)}</b><br>${esc(e.degree)} · ${esc(e.dates)}</p>`).join('')}
<h2>Skills and languages</h2>
<div class="skills"><p><b>Core skills:</b> ${esc(d.top_skills.join(', '))}</p><p><b>Languages:</b> ${esc(d.languages.join(', '))}</p></div>
</body></html>`;

const tmp = join(here, '.resume-render.html');
writeFileSync(tmp, html, 'utf8');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
try {
  const page = await browser.newPage();
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: out, format: 'Letter', printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font-size:7.5pt;font-family:'DM Mono',monospace;color:#8a8c94;padding:0 0.6in;display:flex;justify-content:space-between"><span>${esc(d.name)} · résumé</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
  });
  console.log('wrote', out);
} finally {
  await browser.close();
  unlinkSync(tmp);
}
