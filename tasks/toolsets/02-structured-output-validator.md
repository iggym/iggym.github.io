# Structured Output Validator

## Problem
Asking a model for JSON works until it doesn't: a trailing comment, a missing field, a string where a number should be, Markdown fences around the object. Teams find out in production logs.

## Who it's for
Developers wiring model output into code: extraction, classification, tool arguments, anything parsed downstream.

## MVP scope
- Paste a JSON Schema, or paste an example object and generate a draft schema from it.
- Generate the prompt snippet that asks for that shape: field list with types and descriptions, one valid example, and "return only JSON".
- Paste one or many model outputs. For each, show: parse result, schema errors with JSON paths, and a repaired version when the fix is mechanical (strip code fences, trailing commas, single quotes, wrap a bare array).
- Summary across outputs: % valid as-is, % valid after repair, most common error.
- Export the schema in OpenAI `response_format`, Anthropic tool `input_schema`, and Pydantic and Zod forms.

## Out of scope
- Calling a model.
- Full JSON Schema 2020-12 support; cover the subset providers accept (type, properties, required, enum, items, nested objects, anyOf for nullables).

## Acceptance criteria
- [ ] Validates against a schema with nested objects, arrays, enums and required fields, and reports errors by path.
- [ ] Repairs fenced, trailing-comma and single-quoted JSON, and marks repaired outputs clearly.
- [ ] The four schema exports are valid for their target (checked against each provider's documented shape).
- [ ] 200 pasted outputs validate in under a second.
- [ ] Shared toolset rules are met.

## Effort
S

## Builds on
`tool-kit.js`. A small schema validator written for this tool (no large dependency).

## Status
Not started
