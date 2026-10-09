# Project Analysis & Audit Report (`iggym.github.io`)

_Audit Date: 2026-10-09 · Branch: `arena/bee62a34-iggym-github-io` (base commit `9191237`)_

---

## 1. Executive Summary

`iggym.github.io` is the personal engineering portfolio, interactive AI tooling workbench, and technical writing hub for **Iggy Mwangi**. The project is built around a local-first, zero-framework, static HTML/CSS/JS architecture deployed directly on GitHub Pages.

### Current Repository Footprint

| Layer | Artifacts | Notes |
| :--- | :--- | :--- |
| **Core Pages (3)** | `index.html`, `sites/index.html`, `404.html` | Editorial light/dark design system (`Fraunces`, `Source Sans 3`, `DM Mono`), interactive prompt demo, agent simulator, and 17-site index. |
| **Interactive Tools (10)** | `tools/*.html` + `tools/index.json` | 8 local-only browser tools, 1 BYO-API-key workspace (`ai-aggregator.html`), and 1 Cloudflare Worker-backed tool (`claude_context_engine_premium.html`). |
| **Long-Form Essays (2)** | `articles/context-orchestration.html`, `articles/token-economics.html` + `articles/index.json` | Standalone interactive essays with custom scroll animations and inline token/latency visualizers. |
| **Shared Frontend Assets** | `assets/css/*.css` (5 files), `assets/js/*.js` (7 files), `assets/fonts/*.woff2` (7 files), `assets/img/**` | Shared prompt linter/tightener, `<dialog>` site map (`Explore`), theme switcher, and `ToolKit` helper library. |
| **Résumé Pipeline** | `resume/resume.json`, `resume/resume-short.json`, `resume/make_short.py`, `resume/build_docx.py`, `resume/build_pdf.mjs`, `assets/resume/*` | Single-source JSON pipeline generating 8-page and 2-page PDF and Word résumés (excluded from Pages publish via `_config.yml`). |
| **Verification & Backlog** | `tests/check-site.mjs`, `tasks/**` | Zero-dependency Node static verifier (passes across all 15 HTML pages) and product/engineering backlogs. |

### Overall Assessment

The core homepage (`index.html`), `/sites/` directory, and `/tools/` suite demonstrate strong UX craft, fast static delivery, thoughtful progressive enhancement on the homepage, and clear privacy labeling (`Stays on your device`, `Needs your API key`, `Sends text to a server`). However, a deep line-by-line audit across all 15 HTML pages, CSS/JS modules, and build scripts uncovered **security sinks, broken no-JS rendering on essay pages, typography and theme divergence across `/tools/` and `/articles/`, accessibility gaps, metadata/version drift, and missing CI automation**.

---

## 2. Detailed Audit Findings by Domain

### 2.1. Security & Privacy

1. **Unescaped DOM XSS Sink in `tools/context-window-optimizer.html` (Lines 237 & 252)**
   - **Finding**: When a request exceeds the context window (`free < 0`), `biggest.name` (user-controlled section name input) is concatenated directly into an HTML string (`"…starting with “" + biggest.name + "”…"`) and injected via `li.innerHTML = a[1]` at line 252 without HTML escaping.
   - **Impact**: Because the page's Content Security Policy permits `'unsafe-inline'` scripts, a crafted section name (e.g., `<img src=x onerror=...>`) executes arbitrary JavaScript in the page context, including if a malicious config is loaded from `localStorage`.
2. **Permissive `'unsafe-inline'` in Content Security Policy Across All 15 HTML Pages**
   - **Finding**: Every page includes `<meta http-equiv="Content-Security-Policy">`, which is good practice for GitHub Pages, but all 15 pages require `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'` because of inline theme-initialization snippets in `<head>` and inline `<script>`/`<style>` blocks in `index.html`, `articles/*.html`, and `tools/*.html`.
   - **Impact**: Weakens XSS mitigation if any DOM injection sink is introduced. Moving inline scripts to external JS files in `assets/js/` (or using SHA-256 CSP hashes for the tiny `<head>` theme script) would allow dropping `'unsafe-inline'` from `script-src`.
3. **Plaintext API Key Storage in `tools/ai-aggregator.html` (Lines 199–226)**
   - **Finding**: Checking "Remember keys on this device" stores raw OpenAI (`sk-...`) and Anthropic (`sk-ant-...`) keys in `localStorage` under `agg_keys_v2`. While the UI warns users, `localStorage` persists indefinitely across browser restarts and is accessible to any same-origin script on `iggym.github.io` (including all sub-sites hosted under `iggym.github.io/*`!).
   - **Impact**: Crucial GitHub Pages nuance: **all project sites under `https://iggym.github.io/<repo>/` share the exact same web origin (`https://iggym.github.io`) and therefore share `localStorage`**. Storing API keys in `localStorage` exposes them to every script across all 17+ sub-sites hosted on `iggym.github.io`. Defaulting to `sessionStorage` (tab-scoped) or warning explicitly about cross-repo origin sharing on `github.io` is strongly advised.
4. **External Worker Resilience & Transparency (`tools/claude_context_engine_premium.html`)**
   - **Finding**: Calls `https://claude-context-orchestrator.iggy-mw.workers.dev` via `fetch()` (line 216) with no `AbortController` timeout, so a hung worker leaves the button in `"Rewriting…"` indefinitely (`aria-busy="true"`). Furthermore, the worker's source code and privacy/retention policy are not in this repository.
5. **Personal Contact PII in Public Git & Published Résumés (`resume/resume.json`)**
   - **Finding**: While `index.html` intentionally routes contact through LinkedIn, X, and GitHub, `resume/resume.json` (line 5), `resume/resume-short.json`, and the published `assets/resume/*.pdf` and `.docx` files contain a personal phone number and personal Gmail address. This should be explicitly confirmed as intentional.

---

### 2.2. Accessibility (WCAG 2.2 AA) & Progressive Enhancement

1. **Complete Content Invisibility Without JavaScript in `articles/context-orchestration.html` (Lines 117–124)**
   - **Finding**: Unlike `assets/css/home.css` (which scopes scroll-reveal to `html.js.motion .reveal`), `articles/context-orchestration.html` sets `.reveal { opacity: 0; transform: translateY(24px); }` unconditionally.
   - **Impact**: When JavaScript is disabled or blocked, the entire essay body, pillar cards, and closing block remain at `opacity: 0` (completely invisible), contradicting the homepage footer guarantee (*"It works without JavaScript"*).
2. **Empty Interactive Visualizations Without JavaScript in `articles/token-economics.html`**
   - **Finding**: Five core diagram containers (`#stackContainer`, `#timelineContainer`, `#multiAgentNodes`, `#jsonTree`, `#latencyBreakdown`) are empty `<div>` elements populated only by inline JS. Without JS, visitors see empty boxes.
3. **Missing Heading Structure in `articles/context-orchestration.html`**
   - **Finding**: Across 658 lines of HTML, there is only one heading tag (`<h1 class="essay-title">`). Section titles (`01 — The Premise`, `02 — The Three Pillars`, `What This Means for You`) use `<div class="section-label"><span>` and card titles use `<div class="pillar-title">` / `<div class="card-title">`, breaking screen-reader heading navigation.
4. **Missing `<main>` Landmarks, Skip Links, and `:focus-visible` Styles on Article & 404 Pages**
   - **Finding**: Neither `articles/context-orchestration.html` nor `articles/token-economics.html` has a `<main>` landmark, a `.skip` link, or `:focus-visible` styles. `404.html` also lacks a `.skip` link.
5. **Keyboard-Inaccessible JSON Tree in `articles/token-economics.html` (Lines 1353–1367)**
   - **Finding**: Collapsible JSON nodes are built with `<div class="json-node">` and a `click` listener, lacking `role="button"` (or `<button>`), `tabindex="0"`, `aria-expanded`, and keyboard event handling (`Enter` / `Space`).
6. **WCAG AA Color Contrast Failures in Both Essays**
   - **Finding**:
     - `articles/context-orchestration.html`: `--muted: #5a5970` on `--bg: #0a0a0f` yields a **3.02:1** contrast ratio (fails WCAG AA 4.5:1 minimum for small text on `.back-link`, `.meta`, and footer labels).
     - `articles/token-economics.html`: `--text-faint: #444444` on `--void: #080808` yields a **2.07:1** contrast ratio on `10px`–`11px` labels (`.budget-meter-label`, `.section-tag`, `.budget-stat .label`).
7. **Focus Style Gaps in `assets/css/sites.css`**
   - **Finding**: `sites.css` defines hover states (`.jump a:hover`, `.site-card:hover .site-go`, `.site-repo:hover`) without matching `:focus-visible` rules, and `.site-card:focus-within` changes the border color to `--card-accent` (1px) which has low contrast for certain card accents (e.g., `#84cc16`, `#f59e0b` on light background `#ffffff`).

---

### 2.3. Design System, Typography & Visual Coherence

1. **All 10 Tool Pages Omit Self-Hosted Fonts (`assets/css/fonts.css` & `assets/css/tool.css`)**
   - **Finding**: None of the 10 HTML files in `tools/` include `<link rel="stylesheet" href="../assets/css/fonts.css">`. Furthermore, `assets/css/tool.css` (lines 35–37) still defines system fallback font stacks:
     ```css
     --serif: "Iowan Old Style", Palatino, "Palatino Linotype", Georgia, serif;
     --sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
     --mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
     ```
     whereas `assets/css/home.css` uses `"Fraunces"`, `"Source Sans 3"`, and `"DM Mono"`.
   - **Impact**: Navigating from the homepage to any tool causes a noticeable typographic shift in headings, body copy, and monospaced outputs.
2. **Undeclared Fonts in `articles/*.html`**
   - **Finding**: `articles/context-orchestration.html` links `fonts.css` but sets `body { font-family: 'Inter', sans-serif; }` (line 30), and `articles/token-economics.html` sets `--sans: 'DM Sans', sans-serif;` (line 26). Neither `Inter` nor `DM Sans` is loaded in `fonts.css`, causing browsers to fall back to generic system sans-serif instead of `Source Sans 3`.
3. **Hardcoded Dark Themes & Missing Navigation Shell on Essay Pages**
   - **Finding**: Both essays in `articles/` use standalone dark-only stylesheets (`#0a0a0f` and `#080808`) and omit `theme.js`, `site-map.js` (the `Explore` dialog), and the standard site header/footer. Visitors in light mode experience a jarring flash to void-black when opening an essay.
4. **Duplicated CSS Token Blocks Between `home.css` and `tool.css`**
   - **Finding**: Lines 1–78 of `assets/css/home.css` and lines 2–77 of `assets/css/tool.css` duplicate the `:root` and `:root[data-theme="dark"]` design token definitions almost verbatim (with minor drift, such as `--swash: #a5a0f0` vs `#dcd9fb`). Extracting shared tokens into `assets/css/fonts.css` or a dedicated `assets/css/tokens.css` eliminates drift.
5. **Empty CSS Grid Placeholders on Homepage Project Cards (`index.html`, Lines 339–401)**
   - **Finding**: All 8 cards in `#projects` use `<span class="proj-art" aria-hidden="true"></span>`, which renders an identical blank 7.5rem ruled grid panel above every project title, adding vertical height without visual differentiation.

---

### 2.4. SEO, Metadata & Discoverability

1. **Missing `og:image`, Twitter Card Images, and `<link rel="canonical">` on 14 of 15 Pages**
   - **Finding**: Only `sites/index.html` includes `og:image` and `<link rel="canonical">`. `index.html`, all 10 `tools/*.html` pages, and both `articles/*.html` pages lack `og:image` and `canonical` tags (even though tool screenshots already exist in `assets/img/tools/*-light.jpg` and can be used immediately as per-tool `og:image` tags!).
2. **Missing Meta Descriptions, OpenGraph Tags, and Favicons on Essays**
   - **Finding**: `articles/context-orchestration.html` and `articles/token-economics.html` have no `<meta name="description">`, no `og:*` or `twitter:*` tags, and no `<link rel="icon">`.
3. **No `sitemap.xml`, `robots.txt`, or RSS/Atom Feed**
   - **Finding**: There is no `sitemap.xml` or `robots.txt` at the repository root to guide crawlers, nor an RSS/Atom (`feed.xml`) feed for essays and tools.
4. **No JSON-LD Structured Data**
   - **Finding**: Adding schema.org JSON-LD (`Person` + `WebSite` on `index.html`, `SoftwareApplication` on `tools/*.html`, `TechArticle` on `articles/*.html`) would improve rich-snippet indexing.

---

### 2.5. Codebase Maintainability, Data Synchronization & Content Integrity

1. **Broken External Links in `README.md` (Lines 35 & 99)**
   - **Finding**:
     - Line 35: `[**deterministic-agent-supervisor**](https://github.com/iggym/deterministic-agent-upervisor)` is missing the `s` in `supervisor` (`upervisor` → 404).
     - Line 99: `<img width="800" src="https://github.com/platane/snk/raw/output/github-contribution-grid-snake-dark.svg" alt="Contribution Snake" />` embeds the upstream `platane/snk` author's contribution snake rather than `iggym`'s.
2. **Orphaned JSON Manifests (`tools/index.json` & `articles/index.json`) and 4-Way Metadata Duplication**
   - **Finding**: `tools/index.json` and `articles/index.json` are never referenced by any HTML or JS file. Tool and essay titles, descriptions, and URLs are maintained by hand in 4 places: `index.html`, `assets/js/site-map.js`, `tools/index.json`, and `articles/index.json`.
3. **Drifted Cache-Busting Query Strings (`?v=`) Across HTML Pages**
   - **Finding**: Asset version strings have drifted across pages:
     - `assets/css/home.css` is loaded with `?v=20261013a` in `index.html`, but `?v=20261007a` in `404.html` and `sites/index.html`.
     - `assets/js/prompt-tightener.js` and `prompt-lint.js` use `?v=20261008a`, `theme.js` and `tool.css` use `?v=20261007a`, `fonts.css` uses `?v=20261013a`, and `site-map.js` uses `?v=20261015a`.
   - **Impact**: Visitors navigating from `index.html` to `sites/index.html` or `404.html` download `home.css` twice because the cache key differs.
4. **Résumé Build Scripts & Documentation Drift (`resume/` & `tasks/README.md`)**
   - **Finding**:
     - `tasks/README.md` (line 14) still lists `claude/website-redesign-accessibility-w6szl0` as unmerged, though it was merged in PR #16 (`9191237`).
     - `resume/README.md` instructs updating file sizes in `index.html`, `sites/index.html`, and `assets/js/site-map.js` (none of which display file sizes anymore) and omits `make_short.py` and the 2-page build commands.
     - `resume/build_docx.py` (lines 68–70) contains dead code (`for label, items in [('Focus areas', d['focus'])]: pass`) and inserts an extra blank paragraph (`p = doc.add_paragraph(); spacing(p, after=2)`) before the focus bullet list.
     - `resume/make_short.py` (line 32) hardcodes `'title': ''` for `earlier` roles, discarding role titles even though `build_docx.py` and `build_pdf.mjs` are written to render `e['title']`.

---

### 2.6. Performance, Testing & CI/CD

1. **Missing GitHub Actions CI Pipeline (`.github/workflows/`)**
   - **Finding**: `tests/check-site.mjs` runs in <1 second with zero dependencies, but there is no `.github/workflows/` configuration to run it automatically on pull requests and pushes.
2. **Gaps in `tests/check-site.mjs` Static Verification**
   - **Finding**: `tests/check-site.mjs` checks links, anchors, CSP presence, and external script hosts, but does not verify:
     - Presence of `<main>`, `<title>`, `<meta name="description">`, and `<link rel="icon">` on every page.
     - Heading hierarchy (e.g., catching pages with only an `<h1>` and zero `<h2>` headings, or skipped heading levels).
     - Cache-busting `?v=` consistency for the same asset path across all HTML pages.
     - Synchronization between `tools/*.html`, `tools/index.json`, `index.html`, and `assets/js/site-map.js`.
3. **DOM & Image Payload on `sites/index.html` (Lines 58–137)**
   - **Finding**: The decorative `.ribbon` marquee duplicates all 17 thumbnail `<img>` tags 4 times (68 `<img>` elements). Because both `.ribbon-row` strips animate horizontally via CSS `transform`, off-screen `loading="lazy"` images are eagerly triggered as the strip slides. Additionally, several hero images in `assets/img/sites/` are 140–206 KB JPEGs that could be compressed by 40–60% or served as WebP/AVIF.

---

## Prioritized Tasks

The following prioritized tasks translate the analysis and audit findings into a concrete execution plan, ordered by severity, user impact, and architectural leverage.

### P0 — Critical (Security, Broken Functionality & Data Integrity)

1. **[P0-1] Fix DOM XSS sink in `tools/context-window-optimizer.html`**
   - **Target**: `tools/context-window-optimizer.html` (lines 237, 251–252)
   - **Action**: Escape `biggest.name` (or build advice items with `textContent` / safe DOM nodes instead of `innerHTML`) before rendering into `#advice`. Audit all other `.innerHTML` assignments across `tools/*.html` to ensure user inputs are never interpolated unescaped.
   - **Effort**: S (< 1 hour)

2. **[P0-2] Fix broken no-JS rendering in `articles/context-orchestration.html` and `articles/token-economics.html`**
   - **Target**: `articles/context-orchestration.html` (lines 117–124), `articles/token-economics.html`
   - **Action**: Scope `.reveal { opacity: 0; ... }` to `html.js .reveal` (and add `document.documentElement.classList.add('js')` before observing) plus a `@media (prefers-reduced-motion: reduce)` override so content is 100% visible when JS is disabled. Provide static HTML fallback content inside the 5 diagram containers in `articles/token-economics.html`.
   - **Effort**: S (2 hours)

3. **[P0-3] Fix broken GitHub repository link and contribution snake URL in `README.md`**
   - **Target**: `README.md` (lines 35, 99)
   - **Action**: Fix the typo `https://github.com/iggym/deterministic-agent-upervisor` → `https://github.com/iggym/deterministic-agent-supervisor`, and replace or remove the `platane/snk` contribution graph URL so it does not display another user's GitHub activity.
   - **Effort**: S (15 mins)

4. **[P0-4] Isolate API key storage in `tools/ai-aggregator.html` across `iggym.github.io` sub-sites**
   - **Target**: `tools/ai-aggregator.html` (lines 199–226)
   - **Action**: Default API key persistence to `sessionStorage` (tab-scoped) rather than `localStorage` (which is shared across every `iggym.github.io/<repo>/` site on the same origin), or add an explicit warning explaining `github.io` same-origin storage sharing and automatically clear keys on demand.
   - **Effort**: S (1 hour)

---

### P1 — High (Accessibility, Design System Coherence & CI Automation)

5. **[P1-1] Load self-hosted fonts (`fonts.css`) across all 10 tool pages and align `tool.css` typography tokens**
   - **Target**: `tools/*.html` (all 10 files), `assets/css/tool.css` (lines 35–37)
   - **Action**: Add `<link rel="stylesheet" href="../assets/css/fonts.css?v=...">` to all 10 tool pages and update `--serif`, `--sans`, and `--mono` in `assets/css/tool.css` to `"Fraunces"`, `"Source Sans 3"`, and `"DM Mono"` to match `assets/css/home.css`.
   - **Effort**: S (1 hour)

6. **[P1-2] Remediate WCAG 2.2 AA accessibility issues in `articles/context-orchestration.html` and `articles/token-economics.html`**
   - **Target**: `articles/context-orchestration.html`, `articles/token-economics.html`
   - **Action**:
     - Convert `<div class="section-label">` and `<div class="pillar-title">` / `<div class="card-title">` in `articles/context-orchestration.html` into semantic `<h2>` and `<h3>` headings.
     - Add `<main id="main">` landmarks, `.skip` links, and visible `:focus-visible` outlines to both essays.
     - Make `.json-node` items in `articles/token-economics.html` keyboard-accessible (`<button>` or `role="button" tabindex="0" aria-expanded="..."` with `Enter`/`Space` handlers).
     - Increase contrast of `--muted` (`#5a5970` → `#9493ad`) and `--text-faint` (`#444` → `#8a8a8a`) to pass WCAG AA 4.5:1.
   - **Effort**: M (3–4 hours)

7. **[P1-3] Add GitHub Actions CI workflow and expand `tests/check-site.mjs`**
   - **Target**: `.github/workflows/check-site.yml`, `tests/check-site.mjs`
   - **Action**:
     - Create a GitHub Actions workflow that runs `node tests/check-site.mjs` on every push and pull request.
     - Expand `tests/check-site.mjs` to enforce: (a) uniform `?v=` cache-busting strings per asset across all pages, (b) presence of `<main>`, `<meta name="description">`, and `<link rel="icon">`, (c) valid heading hierarchy (at least one `<h1>` and `<h2>` on long-form pages, no skipped levels), and (d) parity between `tools/*.html`, `tools/index.json`, and `assets/js/site-map.js`.
   - **Effort**: S (2 hours)

8. **[P1-4] Unify cache-busting `?v=` query strings across all HTML pages**
   - **Target**: `index.html`, `404.html`, `sites/index.html`, `articles/*.html`, `tools/*.html`
   - **Action**: Synchronize all `?v=` query parameters so shared assets (`home.css`, `fonts.css`, `site-map.css`, `tool.css`, `theme.js`, `site-map.js`, `prompt-lint.js`, `prompt-tightener.js`) use a single consistent version stamp across every page, preventing duplicate asset downloads.
   - **Effort**: S (30 mins)

9. **[P1-5] Add timeout and error recovery to `tools/claude_context_engine_premium.html`**
   - **Target**: `tools/claude_context_engine_premium.html` (lines 206–234)
   - **Action**: Wrap the `fetch('https://claude-context-orchestrator.iggy-mw.workers.dev', ...)` request in an `AbortController` with a 20-second timeout, display clear retry/fallback guidance (linking to local `Context Extractor` / `Prompt Matrix Evaluator` if the worker is unreachable), and document the worker's data-handling policy.
   - **Effort**: S (1 hour)

---

### P2 — Medium (SEO, Code Deduplication, Visual Polish & Content Sync)

10. **[P2-1] Add OpenGraph (`og:image`), Twitter cards, `<link rel="canonical">`, and meta descriptions across all pages**
    - **Target**: `index.html`, `tools/*.html`, `articles/*.html`
    - **Action**:
      - Point each tool page's `og:image` and `twitter:image` to its existing screenshot (`https://iggym.github.io/assets/img/tools/<tool>-light.jpg`).
      - Add `<meta name="description">`, `<link rel="canonical">`, `<link rel="icon">`, and OpenGraph/Twitter tags to both `articles/*.html` pages.
      - Add a dedicated 1200×630 social preview image and `<link rel="canonical" href="https://iggym.github.io/">` to `index.html`.
    - **Effort**: S (1–2 hours)

11. **[P2-2] Integrate `articles/*.html` and `404.html` with the site's typography, light/dark theme, and navigation shell**
    - **Target**: `articles/context-orchestration.html`, `articles/token-economics.html`, `404.html`
    - **Action**: Replace undeclared `'Inter'` and `'DM Sans'` font references in `articles/*.html` with `'Source Sans 3'`, add light/dark theme support (`theme.js`), and include the site header (`Explore` dialog via `site-map.js` + theme toggle) on both essays and `404.html`.
    - **Effort**: M (3–4 hours)

12. **[P2-3] Eliminate CSS token duplication between `assets/css/home.css` and `assets/css/tool.css`**
    - **Target**: `assets/css/fonts.css` (or `assets/css/tokens.css`), `assets/css/home.css`, `assets/css/tool.css`
    - **Action**: Consolidate `:root` and `:root[data-theme="dark"]` custom properties into a single shared stylesheet so color, shadow, and typography tokens are defined in one place.
    - **Effort**: S (1–2 hours)

13. **[P2-4] Replace empty `.proj-art` placeholder boxes on homepage Project cards with bespoke SVG diagrams**
    - **Target**: `index.html` (lines 339–401), `assets/css/home.css` (lines 456–462)
    - **Action**: Replace the 8 identical empty `<span class="proj-art" aria-hidden="true"></span>` grid boxes with lightweight inline SVG architectural motifs or compact terminal/badge headers tailored to each project (`SurfaceLock`, `ModelBump`, `AIBoM`, `Deterministic Agent Supervisor`, `Factory Gate`, `Sliding Window Trim Engine`, `CircuitX`, `Utility Belt`).
    - **Effort**: M (2–3 hours)

14. **[P2-5] Strengthen `:focus-visible` styles on `sites/index.html` (`assets/css/sites.css`)**
    - **Target**: `assets/css/sites.css`
    - **Action**: Add explicit `:focus-visible` rules alongside `:hover` for `.jump a`, `.site-name a`, `.site-go`, and `.site-repo`, and ensure `.site-card:has(a:focus-visible)` displays a high-contrast focus ring in both light and dark themes.
    - **Effort**: S (1 hour)

15. **[P2-6] Harden Content Security Policy by eliminating `'unsafe-inline'` from `script-src`**
    - **Target**: `index.html`, `404.html`, `sites/index.html`, `articles/*.html`, `tools/*.html`
    - **Action**: Move page-specific inline `<script>` logic into external files (or use SHA-256 script hashes for the tiny `<head>` theme-init script) so `script-src` no longer requires `'unsafe-inline'`.
    - **Effort**: M (3–4 hours)

---

### P3 — Low (Build Hygiene, Sitemap/Feeds & Asset Optimization)

16. **[P3-1] Clean up résumé build scripts (`resume/`) and update `resume/README.md` & `tasks/README.md`**
    - **Target**: `resume/build_docx.py`, `resume/make_short.py`, `resume/README.md`, `tasks/README.md`
    - **Action**:
      - Remove the dead loop and stray blank paragraph in `resume/build_docx.py` (lines 68–70).
      - Preserve `r.get('title', '')` in `resume/make_short.py` (line 32) so earlier experience entries retain job titles.
      - Update `resume/README.md` to document `make_short.py` and the 2-page PDF/DOCX build commands, and remove outdated instructions about updating file sizes on the website.
      - Update `tasks/README.md` to mark PR #16 items as merged.
      - Confirm whether personal phone/email in `resume/resume.json` should remain public or be redacted in the public repo build.
    - **Effort**: S (1 hour)

17. **[P3-2] Reconcile or retire orphaned `tools/index.json` and `articles/index.json` manifests**
    - **Target**: `tools/index.json`, `articles/index.json`, `assets/js/site-map.js`
    - **Action**: Either generate `site-map.js` / `tools/index.json` / `articles/index.json` from a single source of truth (feeding the planned Site Platform search & RSS feed in `tasks/projects/06-site-platform.md`) or validate their parity in `tests/check-site.mjs`.
    - **Effort**: S (1–2 hours)

18. **[P3-3] Add `sitemap.xml`, `robots.txt`, JSON-LD structured data, and `feed.xml` (RSS/Atom)**
    - **Target**: Root directory (`sitemap.xml`, `robots.txt`, `feed.xml`), `index.html`, `tools/*.html`, `articles/*.html`
    - **Action**: Add a static XML sitemap and Atom feed covering the homepage, `/sites/`, both essays, and all 10 tools, plus schema.org JSON-LD metadata.
    - **Effort**: S (2 hours)

19. **[P3-4] Optimize `/sites/` image payloads and ribbon DOM node count**
    - **Target**: `assets/img/sites/*.jpg`, `sites/index.html` (lines 58–137)
    - **Action**: Compress the largest JPEG assets in `assets/img/sites/` (`apex-ai-consumer-index.jpg` at 206 KB, `production-ai-patterns.jpg` at 176 KB) or provide WebP sources, and reduce the number of duplicated `<img>` elements in the decorative `.ribbon` marquee.
    - **Effort**: S (1–2 hours)
