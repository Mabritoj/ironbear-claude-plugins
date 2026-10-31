---
type: llm
focus: { source: file, path: docs/design-system-audit.md }
weight: 1
---

PASS if the document notes that tokens are named by hue (e.g. --blue-500, --gray-*) rather than by role, AND notes a theme-structure problem: the dark theme is scoped to :root[data-theme] and/or redefines only some tokens. FAIL if either is missing.
