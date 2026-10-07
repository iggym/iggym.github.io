# Build backlog

What to build next for this site and around it. These are working notes for me, not pages on the website. Nothing in `tasks/` is linked from the site.

- **Toolsets** are single-page browser tools that live in `tools/`, like the Prompt Matrix Evaluator. They run locally, need no account, and should be useful the first time someone opens them.
- **Projects** are larger open-source repos. Several build on what's already shipped (SurfaceLock, ModelBump, AIBoM, Factory Gate, Sliding Window Trim Engine) and on the tools here.

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
