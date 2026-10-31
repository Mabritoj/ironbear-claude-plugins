---
type: llm
focus: { source: file, path: src/styles/tokens.css }
weight: 1
---

PASS if this file defines a light and a dark theme with [data-theme] attribute selectors that also work on a subtree (e.g. `:root, [data-theme="light"]` and `[data-theme="dark"]`). FAIL if themes are keyed only on :root[data-theme=...], only on a .dark class, or there is no dark theme.
