# Prompt Regression CI

## Problem
Prompts change in ordinary pull requests, often as a one-line edit, and nobody can tell from the diff whether behavior got worse. SurfaceLock records what the AI surface is and ModelBump diffs behavior across models, but neither runs on every PR by default.

## Who it's for
Teams with prompts in their repo and a CI pipeline, who want prompt changes reviewed like code changes.

## MVP scope
- A GitHub Action. On a PR, find prompt files changed since the base (using the SurfaceLock lockfile to know where prompts live).
- Run each changed prompt's eval set (the JSONL format from the [Eval Set Builder](../toolsets/01-eval-set-builder.md)) against the base and head versions, with the model and settings from the lockfile.
- Post one PR comment: per prompt, pass rate before and after, newly failing cases with the output, token and cost change.
- Fail the check when the pass rate drops more than a configured threshold.
- Cache results by prompt hash, model and case so unchanged work is not re-run.

## Out of scope
- A hosted dashboard. The PR comment is the interface.
- LLM-as-judge checks in v1.

## Acceptance criteria
- [ ] Works on a sample repo with two prompts and an eval set each; a deliberately bad edit fails the check with the failing case shown.
- [ ] Re-running with no prompt changes makes zero model calls.
- [ ] API keys come only from repository secrets and never appear in logs or comments.
- [ ] Setup is under 15 lines of workflow YAML, documented in the README.

## Effort
L

## Builds on
SurfaceLock (lockfile), ModelBump (behavioral diff), Eval Set Builder (format), Factory Gate (policy check pattern).

## Status
Not started
