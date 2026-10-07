# PII and Secret Redactor

## Problem
People paste logs, transcripts and customer emails into chat models to debug or summarize them. Those contain emails, phone numbers, API keys and names. Redacting by hand is slow and misses things.

## Who it's for
Support engineers, on-call engineers, analysts. Anyone about to paste real data into a model.

## MVP scope
- Detect: emails, phone numbers, IPs, credit card numbers (Luhn-checked), IBANs, API keys and tokens (common provider prefixes plus high-entropy strings), JWTs, URLs with credentials, and custom terms the user lists (customer names, project codes).
- Replace with stable placeholders (`<EMAIL_1>`, `<KEY_2>`) so the text still reads correctly.
- Keep the mapping in the page only, and offer "restore": paste the model's answer back and put the real values in.
- Toggle each category; click a span to keep it.

## Out of scope
- Name detection with ML. Names are handled by the custom list.

## Acceptance criteria
- [ ] A sample log with 10 known secrets of different kinds is fully redacted.
- [ ] Restore puts every placeholder back exactly.
- [ ] The mapping is never written to storage; the page says so.
- [ ] Shared toolset rules are met.

## Effort
S

## Builds on
Masking code in Claude Context Engine.

## Status
Not started
