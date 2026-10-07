# Prompt Injection Scanner

## Problem
RAG pipelines and agents feed retrieved web pages, emails, tickets and tool output straight into the model. Text inside that content can give the model instructions. Most teams never look at what they retrieve.

## Who it's for
Builders of RAG systems, browsing agents, email and support assistants. Security reviewers who need a quick way to show the risk.

## MVP scope
- Paste a document, or a JSON array of retrieved chunks.
- Highlight risky spans with a reason and a severity: instruction-like phrases aimed at a model ("ignore previous", "you are now", "system:"), role or chat markup (`<|im_start|>`, `Human:`), hidden text (zero-width characters, HTML comments, white-on-white CSS, alt text), encoded payloads (long base64, data URIs), links with tracking or exfiltration patterns (URLs with template placeholders, Markdown images pointing at unknown hosts).
- A cleaned copy with hidden characters removed and risky spans fenced as quoted data.
- A short, copyable "untrusted content" wrapper and system-prompt rule to use with the cleaned text.
- Ship a test corpus of 30+ known-bad and known-good samples in the repo.

## Out of scope
- Claims of complete protection. The page must say this is a tripwire, not a guarantee.
- ML classifiers.

## Acceptance criteria
- [ ] Flags every sample in the bad corpus, with at most 2 false positives on the good corpus.
- [ ] Zero-width and bidi control characters are shown visibly and stripped in the cleaned copy.
- [ ] Works on 1 MB of text without freezing the page (chunked scan).
- [ ] Shared toolset rules are met.

## Effort
S

## Builds on
Claude Context Engine's secret masking, `tool-kit.js`.

## Status
Not started
