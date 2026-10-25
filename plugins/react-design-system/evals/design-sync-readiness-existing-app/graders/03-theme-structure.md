---
type: llm
focus: trace
weight: 1
---

readiness.md flags at least one theme-structure problem: the dark theme redefines only some tokens (e.g. --blue-500, --red-500 are light-only), or theming keyed on :root[data-theme] so a subtree can't opt in.
