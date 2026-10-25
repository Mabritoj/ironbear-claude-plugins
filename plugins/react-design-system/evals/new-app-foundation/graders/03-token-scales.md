---
type: llm
focus: { source: file, path: src/styles/tokens.css }
weight: 1
---

PASS if the file defines custom-property scales for font size, spacing, radius and shadow (at least three values each) plus font-family tokens. FAIL if any of those families is missing or has fewer than three values (font-family excepted).
