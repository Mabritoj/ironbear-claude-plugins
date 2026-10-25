---
type: llm
focus: { source: file, path: src/styles/tokens.css }
weight: 1
---

PASS if each color token has a comment on its line or directly above saying when to use it, in at least the first (default) theme block where it is defined. Other theme blocks may repeat the names without comments. FAIL if most color tokens in the default theme have no usage comment.
