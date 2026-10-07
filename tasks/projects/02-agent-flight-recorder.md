# Agent Flight Recorder

## Problem
Most agent frameworks log differently, and many log nothing useful. When a run fails in production there's no faithful record of what the model saw and did.

## Who it's for
Teams running agents in production, on any framework.

## MVP scope
- A small Python and TypeScript library that wraps the Anthropic and OpenAI clients and records every request, response, tool call and tool result.
- Writes OpenTelemetry GenAI spans, or JSONL files when there's no collector.
- Redacts secrets and listed fields before writing (same rules as the [PII and Secret Redactor](../toolsets/06-pii-secret-redactor.md)).
- Sampling and size limits so it's safe to leave on.
- Output opens directly in the [Agent Trace Viewer](../toolsets/07-agent-trace-viewer.md).

## Out of scope
- Storage backend or UI beyond the trace viewer.
- Deterministic replay (a later version).

## Acceptance criteria
- [ ] Two lines of setup in each language; existing calls need no changes.
- [ ] Overhead under 5 ms per call at p95 in a benchmark.
- [ ] Recorded traces from both providers load in the trace viewer.
- [ ] Redaction is on by default and tested.

## Effort
L

## Builds on
Deterministic Agent Supervisor (event model), Agent Trace Viewer.

## Status
Not started
