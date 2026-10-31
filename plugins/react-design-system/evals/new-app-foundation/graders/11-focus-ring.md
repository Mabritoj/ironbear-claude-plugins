---
type: llm
focus: { source: file, path: src/styles/global.css }
weight: 1
---

PASS if there is a global :focus-visible rule that draws an outline whose color uses a var() token. FAIL if there is no such rule, or it uses a literal color.
