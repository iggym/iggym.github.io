# Eval Set Builder

## Problem
People improve a prompt by eye: they try it twice, it looks better, they ship it. Then a case they didn't try breaks. Building even a small test set feels like a project, so it doesn't happen.

## Who it's for
Developers and PMs shipping a prompt-based feature who don't yet have an eval harness. Also anyone who just used the Prompt Matrix Evaluator and wants to know whether the rewrite actually behaves better.

## MVP scope
- Paste a prompt (or arrive from the Prompt Matrix Evaluator with `#p=`). Detect `{{variables}}` and make a column per variable.
- Add test cases as rows: inputs, plus what a good answer must do. Offer starter cases for the prompt type: a normal case, an edge case (empty or very long input), a hostile case (off-topic or injection attempt), and a format case.
- Each case gets checks from a fixed menu, no AI judge needed: contains / doesn't contain, matches regex, valid JSON, matches a JSON Schema, under N words, starts with, one of a list.
- Paste model outputs per case (or a JSONL of outputs) and see pass/fail per check, with a total score.
- Export as JSONL, as a `promptfoo` config, and as a pytest file. Import the same JSONL back.
- Save sets in localStorage under a name.

## Out of scope
- Calling model APIs from the tool (that's the Multi-Model Workspace's job; a later version can link the two).
- LLM-as-judge grading.
- Team sharing or accounts.

## Acceptance criteria
- [ ] A prompt with two `{{variables}}` produces a table with two input columns and four starter cases.
- [ ] All seven check types run in the browser and show which case failed and why.
- [ ] Exported promptfoo YAML runs with `npx promptfoo eval` without edits.
- [ ] Exported JSONL re-imports to an identical set.
- [ ] Arriving from the evaluator with `#p=` pre-fills the prompt.
- [ ] Shared toolset rules in `tasks/README.md` are met.

## Effort
M

## Builds on
Prompt Matrix Evaluator (`assets/js/prompt-lint.js`), `tool-kit.js`. The export format feeds [Prompt Regression CI](../projects/01-prompt-regression-ci.md).

## Status
Shipped: tools/eval-set-builder.html, with checks in assets/js/eval-checks.js. Exports are JSON Lines, promptfoo YAML, and pytest. The promptfoo export has not been run through promptfoo, because it isn't installed here.
