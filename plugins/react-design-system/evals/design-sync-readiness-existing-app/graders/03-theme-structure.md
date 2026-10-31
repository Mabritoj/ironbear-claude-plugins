---
type: llm
focus: { source: file, path: readiness.md }
weight: 1
---

PASS if the document flags at least one theme-structure problem: the dark theme redefines only some tokens (e.g. --blue-500 and --red-500 are light-only), or theming keyed on :root[data-theme] so a subtree cannot opt in. FAIL otherwise.
