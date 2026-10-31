---
type: llm
focus: { source: file, path: docs/design-system-audit.md }
weight: 1
---

PASS if the document reports hardcoded colors outside the token file and names at least two of the files involved (Button.module.css, Card.module.css, ProjectList.module.css, Logo.tsx), AND reports that index.css removes the focus outline (button:focus { outline: none }) with no :focus-visible replacement. FAIL if either part is missing.
