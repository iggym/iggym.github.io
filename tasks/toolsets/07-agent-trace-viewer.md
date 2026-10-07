# Agent Trace Viewer

## Problem
When an agent run goes wrong, the evidence is a long JSON log of messages and tool calls. Reading it raw is slow, and the usual failures (loops, a tool error the model ignored, a context that quietly filled up) are hard to spot.

## Who it's for
Anyone debugging an agent: developers, and the person on call when it misbehaves.

## MVP scope
- Paste or drop a trace: Anthropic Messages, OpenAI Chat or Responses, or OpenTelemetry GenAI spans (JSON). Auto-detect.
- Timeline of turns and tool calls with duration (if timestamps exist), tokens in and out, and running context size.
- Detectors: repeated identical tool calls (loop), tool errors followed by no change in plan, context over 80% of a chosen window, very long tool results, a final answer that doesn't mention a failed step.
- Filter to tool calls only; search; collapse long content.
- Cost estimate for the run at user-set prices.
- Export a short incident summary in Markdown.

## Out of scope
- Live capture (that's [Agent Flight Recorder](../projects/02-agent-flight-recorder.md)).
- Replay against a model.

## Acceptance criteria
- [ ] Each of the three formats loads from a sample file in the repo.
- [ ] A sample trace with a three-call loop is flagged at the right step.
- [ ] A 5 MB trace renders without freezing (virtualized list).
- [ ] Shared toolset rules are met.

## Effort
M

## Builds on
Agent Stateboard (state view), Context Window Optimizer (budget math).

## Status
Not started
