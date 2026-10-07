# Tool Schema Linter

## Problem
Agents pick the wrong tool, or call the right one with bad arguments, mostly because of the tool definitions: vague descriptions, overlapping names, untyped parameters, missing enums. Tool definitions are also sent on every request, so bloated ones cost money all day.

## Who it's for
Anyone building an agent or an MCP server.

## MVP scope
- Paste tool definitions as OpenAI `tools`, Anthropic `tools`, or an MCP `tools/list` response. Auto-detect which.
- Checks per tool: description present and long enough to say when to use it and when not to; name is verb_noun and unique; parameters all typed and described; enums where the values are a fixed set; required list matches; no two tools with near-identical descriptions (flag overlap).
- Token cost of the whole tool block per request and per month at a given volume.
- Convert between the three formats.

## Out of scope
- Running the tools or connecting to an MCP server.

## Acceptance criteria
- [ ] Each format is detected and parsed; a malformed input gets a clear error with a line number.
- [ ] Two tools with overlapping descriptions are flagged with both names.
- [ ] Conversions round-trip without losing fields.
- [ ] Shared toolset rules are met.

## Effort
S

## Builds on
Prompt Matrix Evaluator patterns (checklist and score UI), Context Window Optimizer (token cost).

## Status
Not started
