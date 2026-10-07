# Model Migration Assistant

## Problem
Models get deprecated on a schedule, and teams find the old model IDs scattered across code, config, notebooks and infra. Upgrading is a scramble, and behavior changes go unnoticed.

## Who it's for
Any team with model IDs in its codebase.

## MVP scope
- A CLI (`npx` and `pipx`) that scans a repo for model IDs across languages and config formats, using AIBoM's detectors.
- Matches each against a maintained table of providers' deprecation dates and suggested replacements.
- Report: what's used where, what retires when, and the suggested target.
- `--fix` writes the replacements on a new branch, and optionally runs ModelBump on prompts that use the changed models.

## Out of scope
- Automatically merging anything.

## Acceptance criteria
- [ ] Finds model IDs in Python, TypeScript, YAML, JSON, `.env` and Terraform samples.
- [ ] The deprecation table lives in its own file with a source link and date for each entry.
- [ ] `--fix` changes only the matched IDs (verified on a sample repo).

## Effort
M

## Builds on
AIBoM (detection), ModelBump (behavioral diff), SurfaceLock (lockfile update).

## Status
Not started
