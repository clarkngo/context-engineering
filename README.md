# Context Engineering

A reference and pattern guide for context engineering — deciding what actually
goes into an LLM's context window and why, as distinct from prompt engineering
(the phrasing of instructions, not the budget of everything else competing for
space: retrieved documents, tool schemas, conversation history, examples,
memory).

**Live site:** https://clarkngo.github.io/context-engineering/

## Contents

- **Landing / framing** — the context window as a finite, shared budget; most
  failures (hallucination, drift, "lost in the middle", stale answers) trace
  back to what was or wasn't in context, not model capability.
- **Pattern catalog** — RAG chunking, context compression/summarization,
  short-term vs. long-term memory, tool-result truncation, prompt/context
  caching, structured vs. freeform context injection. Each entry: the problem
  it solves, the tradeoff it makes, and tags.
- **Anti-patterns** — context rot, lost-in-the-middle, redundant context,
  unbounded context growth in agent loops.

## Stack

Static HTML/CSS/vanilla JS, no build step or framework. Content lives in
[`content.json`](content.json) and is rendered client-side by
[`app.js`](app.js). Light/dark theme via CSS custom properties with a manual
toggle (persisted to `localStorage`). Deploys to GitHub Pages on every push to
`main` via [`.github/workflows/static.yml`](.github/workflows/static.yml).

## Status

First pass: landing page, pattern catalog, and anti-pattern section are done
as static content. An interactive context-budget diagram (a stacked bar for
system prompt / tools / retrieved docs / history / user turn, driven by
example scenarios) is planned as a follow-up.