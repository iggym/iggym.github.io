# Context Pack CLI

## Problem
Coding agents work better with a good `CLAUDE.md` or `AGENTS.md` and the right files in context. Writing that file well, and keeping it current and within budget, is tedious.

## Who it's for
Developers using coding agents on real repos.

## MVP scope
- Scan a repo and draft an agent instructions file: build and test commands (from package files and CI config), layout, conventions found in lint config, and a "don't touch" list from generated and vendored paths.
- Build a "context pack" for a task: given a file or symbol, collect related files ranked by imports and recent co-changes, trimmed to a token budget.
- Report the token cost of the pack.

## Out of scope
- Calling a model to write the instructions in v1. The draft comes from repo facts only.

## Acceptance criteria
- [ ] On three sample repos (Python, TypeScript, Go), the drafted file lists the correct test command.
- [ ] Packs never exceed the token budget.
- [ ] Runs offline.

## Effort
M

## Builds on
Portable Context Engine (profiles), Sliding Window Trim Engine (budgeting), Context Extractor.

## Status
Not started
