# Build backlog

What to build next for this site and around it. These are working notes for me, not pages on the website. Nothing in `tasks/` is linked from the site.

- **Toolsets** are single-page browser tools that live in `tools/`, like the Prompt Matrix Evaluator. They run locally, need no account, and should be useful the first time someone opens them.
- **Projects** are larger open-source repos. Several build on what's already shipped (SurfaceLock, ModelBump, AIBoM, Factory Gate, Sliding Window Trim Engine) and on the tools here.

_Updated 2026-10-08._

## Needs you

Decisions and actions only you can take. Tick them off here as you go.

- [ ] **Review and merge** the branch `claude/website-redesign-accessibility-w6szl0`. Unmerged so far: `05d4f5e` (recent work and results), `f38788e` (Nubla results and NDA note), `f269543` (fonts, CSP, test suite, cleanup). Ask me to open the PR when you're ready.
- [ ] **Check the NDA note** in the Work section against your agreements with VynixAI and Nubla AI. Reword it if the agreements say something narrower.
- [ ] **Confirm the six results** can be published without a stated baseline or measurement method: 38%, 42%, 27%, 70% (VynixAI) and 22%, 35% (Nubla AI).
- [ ] **Decide on "Project Titan"**. It's an internal Apple codename, so it may fall under confidentiality terms. Your résumé does say "reducing spend by more than 30% YoY" under Apple, so the audit's FinOps figure is accurate. Pick wording or leave it out.
- [ ] **Confirm Contran Corp** as the replacement for Verizon in the hero line and Background. The alternative is Ackerman McQueen (2 years 4 months).
- [ ] **Check the Context Engine Worker.** The tool's "Sends text to a server" tag relies on `claude-context-orchestrator.iggy-mw.workers.dev`, whose source isn't in this repo. Confirm the data policy matches the tag.
- [ ] **Choose four layer names** for grouping the 17 sites (Site work, item 4). Or approve the audit's names.
- [ ] **Decide on the Token Router name.** "Token Router" is jargon for a rate-limit planner. Renaming it touches the page title, the Explore dialog, and `tools/index.json`.
- [ ] **Choose the CSP level.** Inline scripts still need `'unsafe-inline'`. Accept that, or let me move them to hashes, which is stronger but needs updating on every edit.
- [ ] **Supply a social share image** (1200 × 630 px) for `og:image` on the homepage and tool pages.
- [ ] **Supply real project visuals** (screenshots or diagrams) to replace the grey placeholder panels on the project cards.
- [ ] **Check GitHub Pages** in the repo's Settings → Pages and the Actions tab. Confirm the source is `main` and the last build succeeded. I can't see deploy status from here.
- [ ] **Check the live site** after the next deploy, in Chrome and Edge: headline timing, Replay, fonts, and layout.
- [ ] **Confirm the Cloudflare Web Analytics wording** in the footer is accurate.
- [ ] **Review the new résumé** (`assets/resume/iggy-resume.pdf` and `.docx`, built from `resume/resume.json`). Decide on these:
  - Top skills: I replaced "Google Gemini, gemma, GPT-4" with skills drawn from the résumé. Keep, or restore the originals.
  - Older roles (1998 to 2009) are kept in full, making eight pages. Condense them to a short list for a shorter résumé?
  - The résumé still lists Verizon, while the website shows Contran in its place. Decide which should appear.
  - The Word file could not be rendered in this environment (LibreOffice doesn't run here). Open it in Word and check the layout.
- [ ] **Approve the résumé link layout** on the homepage (recommended: one "Get the résumé" group in Work with me, with full PDF, two-page PDF, and Word; one nav link and one footer link). Then I'll implement it.
- [ ] **Run your audit** on the branch and send the findings back. I'll triage them against this list.

## Site work

Status of the audit items on the site. Shipped items are on the branch above until it's merged.

| # | Item | Status |
|---|------|--------|
| 1 | Hero headline timing and crossfade (no stray fragments; starts after paint; slower; Replay) | Merged (PR #13, #14) |
| 2 | Recent work: VynixAI and Nubla AI roles; six results; Contran replaces Verizon | Shipped on branch (`05d4f5e`, `f38788e`) |
| 3 | Self-host fonts (DM Mono, Fraunces, Source Sans 3); remove Google Fonts | Shipped on branch (`f269543`) |
| 4 | Content Security Policy on every page, with per-page host allowlists | Shipped on branch (`f269543`); inline scripts still need `'unsafe-inline'` |
| 5 | Replace GitHub OpenGraph project images with CSS panels | Shipped on branch (`f269543`) |
| 6 | Remove seven unused files (`tokens.css`, `main.css`, `animations.css`, four JS files) | Shipped on branch (`f269543`) |
| 7 | `tests/check-site.mjs`: links, anchors, CSP, and allowlisted hosts (Node built-ins only) | Shipped on branch (`f269543`) |
| 8 | Verify "Stays on your device" tools make no external requests | Verified: all 8 do not |
| 9 | Add `og:image` and Twitter card to the homepage and tool pages | Open, needs an image from you |
| 10 | Replace project placeholder panels with real visuals | Open, needs visuals from you |
| 11 | Stricter CSP without `'unsafe-inline'` (hashes or nonces) | Open, depends on your choice above |
| 12 | Measure Lighthouse performance, CLS, and FCP | Open, can't run Lighthouse here |
| 13 | Add real heading structure to `articles/context-orchestration.html` (one heading tag in 657 lines) | Open |
| 14 | Add visible focus styles to the sites page (`sites.css` has none) | Open |
| 15 | Keep `?v=` cache-busting consistent across pages (versions have drifted) | Open |
| 16 | Consolidate the 17 sites into four layers | Open, needs your layer names |
| 17 | Résumé rebuilt from one source; PDF and Word versions; site links updated | Shipped on branch (this commit) |

**Deferred or rejected from the audit**

- **Void-black design system and glassmorphism** (audit 2.1, 2.2): rejected. It's the unused design, and you chose the light editorial look.
- **IBM Plex Mono and Bebas Neue** (audit 1.1): rejected. The site uses DM Mono, Fraunces and Source Sans 3.
- **Tier-1 hero metrics as written** (audit 4.1): deferred. It has a misstated figure and an unclear codename (see Needs you).
- **Exact token counts** (audit 3.1): deferred. Matching cl100k or o200k needs a tokenizer library, which conflicts with the zero-dependency rule.
- **Shared ToolKit import/export bus** (audit 3.4): deferred. Sizeable, and not needed yet.
- **Stateboard LangGraph and AutoGen snippets** (audit 3.3): deferred. The Python and Mermaid exports already exist.
- **Context Extractor compaction** (audit 3.2): deferred. The extractor already produces handoff prompts and JSON.

## How to use this

1. Pick the top item in **Now** that isn't started.
2. Set its **Status** to `In progress` in the spec and in the table below.
3. Build to the acceptance criteria. Anything outside **MVP scope** waits for a follow-up.
4. When it ships, set **Status** to `Shipped` with the date and link, add it to `assets/js/site-map.js` and the homepage tool list, and run the accessibility audit (WCAG 2.2 AA, both themes, 1280 and 390 px).

Every spec uses the same sections: Problem, Who it's for, MVP scope, Out of scope, Acceptance criteria, Effort, Builds on, Status.

Effort: **S** is a day or two, **M** is about a week, **L** is several weeks.

## Priorities

### Now

| # | Item | Type | Effort | Why now | Status |
|---|------|------|--------|---------|--------|
| 1 | [Eval Set Builder](toolsets/01-eval-set-builder.md) | Toolset | M | The natural next step after scoring a prompt is testing it. Feeds project 1. | Not started |
| 2 | [Structured Output Validator](toolsets/02-structured-output-validator.md) | Toolset | S | JSON output failures are the most common production bug I see. | Not started |
| 3 | [Prompt Injection Scanner](toolsets/04-prompt-injection-scanner.md) | Toolset | S | Every RAG and agent builder needs it; almost nobody checks. | Not started |
| 4 | [Prompt Regression CI](projects/01-prompt-regression-ci.md) | Project | L | Turns SurfaceLock and ModelBump into something teams run on every PR. | Not started |

### Next

| # | Item | Type | Effort | Status |
|---|------|------|--------|--------|
| 5 | [Agent Trace Viewer](toolsets/07-agent-trace-viewer.md) | Toolset | M | Not started |
| 6 | [Tool Schema Linter](toolsets/03-tool-schema-linter.md) | Toolset | S | Not started |
| 7 | [Model Migration Assistant](projects/04-model-migration-assistant.md) | Project | M | Not started |
| 8 | [PII and Secret Redactor](toolsets/06-pii-secret-redactor.md) | Toolset | S | Not started |
| 9 | [Edge LLM Gateway](projects/03-edge-llm-gateway.md) | Project | L | Not started |

### Later

| # | Item | Type | Effort | Status |
|---|------|------|--------|--------|
| 10 | [RAG Chunking Tuner](toolsets/05-rag-chunking-tuner.md) | Toolset | M | Not started |
| 11 | [LLM Cost Forecaster](toolsets/08-llm-cost-forecaster.md) | Toolset | S | Not started |
| 12 | [Agent Flight Recorder](projects/02-agent-flight-recorder.md) | Project | L | Not started |
| 13 | [Context Pack CLI](projects/05-context-pack-cli.md) | Project | M | Not started |
| 14 | [Site platform: search, RSS, shared tool shell](projects/06-site-platform.md) | Project | M | Not started |

## Shared rules for toolsets

- Runs in the browser with no build step. Shared code goes in `assets/js/` (see `prompt-lint.js`, `prompt-tightener.js`, `tool-kit.js`).
- Stays on the visitor's device unless the tool says otherwise with a visible tag. No analytics on pasted content.
- Loads with a realistic example already filled in, so the first screen shows a useful result.
- Every result can be copied or exported in a format another tool accepts (JSON, JSONL, YAML, Markdown, CSV).
- Works without JS where possible (show the example output statically), keyboard-only, and with reduced motion.
- Passes the axe audit in both themes at 1280 and 390 px with no horizontal scroll.
- Add `?v=` cache-busting to new asset links, and bump it on every release.
