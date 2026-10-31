---
type: llm
focus: { source: file, path: src/styles/tokens.css }
weight: 1
---

PASS if no color token value uses color-mix() or calc(); each is a literal color or a var() alias of another color token. calc() on non-color tokens is fine. FAIL otherwise.
