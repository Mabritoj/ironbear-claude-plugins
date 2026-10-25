---
type: llm
focus: trace
weight: 1
---

docs/design-system-audit.md reports hardcoded colors outside the token file with file names (at least two of Button.module.css, Card.module.css, ProjectList.module.css, Logo.tsx) and reports that index.css removes the focus outline (button:focus { outline: none }) with no :focus-visible replacement.
