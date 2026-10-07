# Edge LLM Gateway

## Problem
Every team writing their own retry, rate-limit and fallback code around model APIs gets it slightly wrong. Interactive traffic ends up queued behind batch jobs, and one runaway script can burn the month's budget.

## Who it's for
Small teams that want the core of an AI gateway without running infrastructure.

## MVP scope
- A Cloudflare Worker that speaks the Anthropic and OpenAI APIs, so clients only change their base URL.
- Priority lanes (interactive, background, batch) with per-lane token budgets, matching the Token Router tool's model.
- Retries with backoff on 429 and 5xx; fallback to a second model or provider when configured.
- Daily and monthly spend caps per key, with a clear error when hit.
- Exact-match response cache for deterministic requests (temperature 0).
- Usage log to Workers Analytics Engine or a D1 table.

## Out of scope
- Semantic caching, a web console, multi-tenant billing.

## Acceptance criteria
- [ ] Deploys with `wrangler deploy` and one config file.
- [ ] Under a simulated 429 storm, interactive requests keep a p95 under 2x normal while batch requests queue.
- [ ] Spend caps stop traffic within one request of the limit.
- [ ] Provider keys are stored as Worker secrets only.

## Effort
L

## Builds on
Token Router tool (backpressure model), CircuitX-style circuit breaking, Production AI Patterns.

## Status
Not started
