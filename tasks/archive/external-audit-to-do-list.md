# Iggy Mwangi Portfolio Architecture: Master Engineering To-Do List

This backlog translates the **13 Core Engineering & Experience Tenets** into a prioritized, sequenced implementation plan for `iggym.github.io`. Every task strictly adheres to the site's zero-dependency vanilla JavaScript, pure CSS, single-file deployment, and local-first execution model.

---

## The 13 Core Engineering & Experience Tenets Mapping

| Tenet | Architectural Invariant | Primary Backlog Milestone |
| :--- | :--- | :--- |
| **High Utility** | Every tool delivers immediate, zero-auth, real-world utility in a single visit. | Milestone 3.1, 3.2 |
| **High Leverage** | Small user inputs yield compounding systems output (token savings, AST schemas, state DAGs). | Milestone 3.1, 3.3 |
| **High Agency** | The user inspects, edits, rolls back, and controls every computation step without lock-in. | Milestone 3.2, 3.4 |
| **High Integrity** | Local-first computation; privacy tags (`tag-local`) strictly match network behavior. | Milestone 1.2, 4.3 |
| **High Trust** | Verifiable technical claims; direct links to live reproducible artifacts and repos. | Milestone 4.1, 4.2 |
| **High Coherence** | Uniform visual grammar, deterministic state transitions, and unified design tokens. | Milestone 2.1, 2.3 |
| **High Quality** | Sub-millisecond interaction feedback, zero layout shifts (CLS = 0), and clean typography. | Milestone 1.1, 2.2 |
| **High Performance** | Zero-framework static delivery; sub-100ms FCP; strictly no render-blocking CDNs. | Milestone 1.1, 1.3 |
| **High Resilience** | Works offline; graceful degradation without JS; zero external runtime dependencies. | Milestone 1.2, 1.4 |
| **High Composability** | Tools emit and ingest standard schemas (JSON, JSONL, YAML, Markdown AST, Mermaid). | Milestone 3.3, 3.4 |
| **High Accessibility** | WCAG 2.2 AA compliance across themes, complete keyboard traps/nav, semantic ARIA. | Milestone 1.4, 2.4 |
| **High Adaptability** | Fluid typography, container queries, and responsive grid layouts (320px to 4K). | Milestone 2.3, 2.4 |
| **High Clarity** | Industrial precision; zero colloquial filler; technical systems engineering copy. | Milestone 2.2, 4.1 |

---

## Sequenced Engineering Milestones

### Phase 1: Technical Architecture & Core Resilience
*Focus Tenets: High Performance, High Resilience, High Integrity, High Accessibility*

- [ ] **1.1. Self-Host Typography & Eliminate External Font Egress**
  - **Problem**: `index.html` loads fonts via render-blocking HTTP requests to `fonts.googleapis.com` and `fonts.gstatic.com` (`DM Mono`, `Fraunces`, `Source Sans 3`), violating zero-external-dependency integrity and harming FCP/LCP.
  - **Action**: Download modern WOFF2 subsets for `IBM Plex Mono` (weights 400, 500, 600) and `Bebas Neue` (weight 400). Store under `assets/fonts/`. Declare `@font-face` definitions with `font-display: swap` in `assets/css/tokens.css`.
  - **Verification**: Zero network requests to Google Fonts; 0ms third-party DNS lookup; Lighthouse Performance score = 100.

- [ ] **1.2. Replace Dynamic OpenGraph Project Images with Inline SVG Architecture Badges**
  - **Problem**: Section 04 uses `https://opengraph.githubassets.com/1/iggym/...` with dynamic `onerror="this.remove()"`, causing CLS, third-party network failure vulnerability, and layout jank.
  - **Action**: Remove GitHub OpenGraph image tags. Replace each project preview with an inline, deterministic SVG architecture topology or zero-dependency CSS preview card with explicit CLI syntax blocks.
  - **Verification**: Zero external image requests; CLS = 0.00; projects render identically offline.

- [ ] **1.3. Enforce Content Security Policy (CSP) & Subresource Integrity**
  - **Problem**: No CSP meta tags exist, permitting uncontrolled script injection or rogue network calls.
  - **Action**: Add strict HTTP-equiv `<meta http-equiv="Content-Security-Policy">` in `index.html` and all `tools/*.html` restricting `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'`.
  - **Verification**: Browser console reports zero violations while blocking any undeclared external call.

- [ ] **1.4. Full WCAG 2.2 AA Contrast & Accessibility Hardening**
  - **Problem**: Monospaced tags and muted subtext (`--muted: #52525C` on `#0A0A0B` / `#000000`) fail AA contrast standards (2.8:1 ratio vs. required 4.5:1). Interactive SVG coordinates lack keyboard focus rings.
  - **Action**: Recalibrate muted contrast tokens in `tokens.css` (`--text-muted: #A1A1AA` for 5.4:1 contrast on void black). Add visible 2px International Orange outline `:focus-visible` rings across all controls. Add keyboard accessibility to SVG state loops.
  - **Verification**: Automated `axe-core` and manual screen-reader audits yield 0 errors.

---

### Phase 2: Design Language, Industrial Aesthetic & Brand Realignment
*Focus Tenets: High Clarity, High Quality, High Coherence, High Adaptability*

- [ ] **2.1. Establish Void Black (`#000000`) & International Orange (`#FF4F00`) Master Tokens**
  - **Problem**: Split CSS architecture (`home.css` uses an indigo/off-white theme while `tokens.css` and `main.css` use an unlinked dark scheme).
  - **Action**: Unify CSS variables into `assets/css/tokens.css` as the single source of truth:
    ```css
    :root {
      --void-pure: #000000;
      --void-surface: #0C0C0E;
      --void-border: #1D1D22;
      --accent-orange: #FF4F00;
      --accent-glow: rgba(255, 79, 0, 0.18);
      --status-emerald: #00D084;
      --font-mono: 'IBM Plex Mono', monospace;
      --font-display: 'Bebas Neue', sans-serif;
    }
    ```
  - **Verification**: Consistent chromatic signature across `index.html`, `sites/index.html`, and `tools/*.html`.

- [ ] **2.2. Implement Multi-Layered Frosted Glass Panels (Glassmorphism)**
  - **Problem**: Surface panels currently rely on flat 1px solid borders without depth or modern edge illumination.
  - **Action**: Build `.glass-surface` utility utilizing `backdrop-filter: blur(16px)`, `background: rgba(12, 12, 14, 0.72)`, subtle inner highlight `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`, and sub-surface border radiance.
  - **Verification**: Visual inspection under light and dark overlays shows crisp Apple/Stripe-level depth.

- [ ] **2.3. Stabilize Self-Editing Hero Headline & Prevent Metric Shift**
  - **Problem**: The dynamic token-pruning headline (`#hero-title`) recalculates layout dimensions during playback, inducing text reflow on mobile.
  - **Action**: Reserve bounding box dimensions using CSS `contain: layout` or fixed min-height calculation pinned before the animation timeline executes. Add explicit `prefers-reduced-motion` bypass.
  - **Verification**: Headline transitions smoothly without vertical layout jitter across 375px, 768px, and 1440px viewports.

---

### Phase 3: Interactive Tooling, Context Architecture & Composability
*Focus Tenets: High Utility, High Leverage, High Agency, High Composability*

- [ ] **3.1. Extend Prompt Matrix Evaluator with AST Rule Engine & JSON Schema Export**
  - **Problem**: Prompt evaluation relies on regex heuristic lists; lacks formal AST parsing and structured schema export.
  - **Action**: Refactor `assets/js/prompt-lint.js` to parse prompts into tokenized blocks (System Directives, Constraints, Input Payloads, Output Specifications). Add 1-click export of system prompts formatted as JSON, XML, or Anthropic `<thinking>` blocks.
  - **Verification**: Complex prompt produces valid JSON schema and token boundary count matching cl100k/o200k specs.

- [ ] **3.2. Implement Context Extractor Memory-Compaction Engine**
  - **Problem**: `tools/context-extractor.html` outputs plain text; lacks DAG-ordered context handoff compaction.
  - **Action**: Add deterministic deduplication, entity extraction (Regex-based zero-dependency NER for keys, variables, IDs), and automatic session handoff prompt generation formatted for Claude 3.5 Sonnet and GPT-4o context windows.
  - **Verification**: 4,000-word chat log compresses to <600 tokens with zero loss of critical operational constraints.

- [ ] **3.3. Deterministic Agent Stateboard: Add Python FSM / Mermaid DAG Code Generation**
  - **Problem**: Stateboard simulation runs locally but needs immediate clipboard integration for production agent frameworks.
  - **Action**: Build direct one-click code generation emitting:
    1. LangGraph StateGraph Python snippet
    2. AutoGen 2.0 deterministic transition handler
    3. Standalone zero-dependency Python `enum.Enum` state machine loop
  - **Verification**: Generated Python snippet runs cleanly in Python 3.10+ without syntax errors.

- [ ] **3.4. Shared ToolKit Universal Import/Export Bus**
  - **Problem**: State stored in `localStorage` across tools cannot easily be transferred between tools.
  - **Action**: Extend `assets/js/tool-kit.js` with an event-driven universal schema bus (`ToolKit.schema.exportAll()` / `ToolKit.schema.importBundle()`), allowing stateboard configs, extracted context, and prompt matrices to be bundled into a single `.json` flight recorder archive.
  - **Verification**: Complete multi-tool session state round-trips via single JSON file without loss.

---

### Phase 4: Professional Positioning, Systems Governance & Pedigree
*Focus Tenets: High Trust, High Clarity, High Coherence, High Adaptability*

- [ ] **4.1. Refactor Hero Positioning with Tier-1 Enterprise Metrics**
  - **Problem**: Iggy's senior tenures at Apple (Project Titan), Sam's Club, AT&T, and Verizon are buried under a tiny, passive subtext string.
  - **Action**: Replace casual lede with an authoritative enterprise architecture hero strip showcasing:
    - **Apple Project Titan**: Cloud modernization, Kubernetes hardening, 30% YoY FinOps cloud spend reduction.
    - **Sam's Club**: Retail-scale forecasting, computer vision, and MLOps platforms across 4+ years.
    - **AT&T / Verizon**: Enterprise Service Bus, SOA architecture, and iPhone 3G launch readiness.
    - **VynixAI / Nubla AI**: 38% reduction in hallucinations via vector hygiene; 42% boost in multi-tool routing reliability.
  - **Verification**: Recruiter or VP of Engineering immediately identifies enterprise-scale capability within 5 seconds.

- [ ] **4.2. Unify "Seventeen Sites" Sprawl into a Consolidated Architecture Index**
  - **Problem**: Section 05 scatters authority across 17 external sub-sites, creating an impression of fragmented hobby projects.
  - **Action**: Group the 17 properties into four functional architectural layers on `sites/index.html` and the main site:
    1. *Context Engineering & Ingestion Systems*
    2. *Inference Routing, Gateways & Backpressure*
    3. *Agent Supervision & Deterministic State Governance*
    4. *Production Runbooks & Incident Response*
  - **Verification**: Navigation feels like a cohesive enterprise platform rather than disjointed repositories.

- [ ] **4.3. Audit Verification Badge & Automated Headless Test Suite**
  - **Problem**: No automated verification confirms that zero-dependency tools continue to work without regressions.
  - **Action**: Create `tests/test-tools.sh` using headless curl and lightweight Node/Python DOM checks to verify:
    - Status code 200 on all static pages.
    - Zero external network script references.
    - Zero broken local anchor links or missing CSS/JS assets.
  - **Verification**: CI script runs locally in <2 seconds with 100% pass rate.
