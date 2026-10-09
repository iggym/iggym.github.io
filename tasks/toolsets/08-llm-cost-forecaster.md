# LLM Cost Forecaster

## Problem
Cost estimates for AI features are usually one multiplication in a spreadsheet. They miss prompt caching, batch discounts, output-heavy workloads, retries, and growth, so the bill surprises people.

## Who it's for
Engineering leads and PMs pricing a feature, and founders modeling margins.

## MVP scope
- Describe a workload: requests per day, input and output tokens, share of input that is cacheable, retry rate, share that can go through a batch API, monthly growth.
- Compare several models side by side from an editable price table (ships with dated defaults and a "check current prices" note).
- Show monthly cost now and in 12 months, cost per request, and the effect of each lever (caching, batching, shorter prompts, a cheaper model for some traffic).
- Share a scenario via URL hash. Export CSV.

## Out of scope
- Live price scraping.

## Acceptance criteria
- [ ] Math matches a hand-checked spreadsheet for three sample scenarios.
- [ ] A scenario URL reopens with identical numbers.
- [ ] Shared toolset rules are met.

## Effort
S

## Builds on
Context Window Optimizer and Rate Limit Planner cost math.

## Status
Not started
