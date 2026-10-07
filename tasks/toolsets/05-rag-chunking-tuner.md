# RAG Chunking Tuner

## Problem
Chunk size and overlap get set once, from a blog post, and never revisited. Bad chunking splits tables and code mid-way and buries answers, and no one can see it happening.

## Who it's for
Developers setting up or debugging retrieval.

## MVP scope
- Paste or drop a document (text, Markdown, HTML).
- Strategies: fixed tokens, sentence, paragraph, Markdown heading, recursive. Size and overlap sliders.
- Visual: the document with chunk boundaries drawn, colored by size; warnings where a boundary cuts a table, list, or code block.
- Stats: chunk count, size distribution, overlap overhead, embedding cost at a price per million tokens.
- Ask a question and see which chunks contain the answer words (keyword match, no embeddings), to check that the answer isn't split.
- Export chunks as JSONL with offsets and heading path.

## Out of scope
- Real embeddings or vector search.

## Acceptance criteria
- [ ] Boundaries update live under 100 ms for a 50-page document.
- [ ] Split tables and code blocks are flagged.
- [ ] Exported offsets map back exactly to the source text.
- [ ] Shared toolset rules are met.

## Effort
M

## Builds on
Context Window Optimizer (budgets), `ToolKit.estimateTokens`.

## Status
Not started
