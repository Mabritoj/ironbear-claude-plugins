---
type: llm
focus: trace
weight: 1
---

Raw color literals appear in exactly one stylesheet under src/ (the tokens file), and that file defines a light and a dark theme with [data-theme] attribute selectors that a subtree can use (not only :root[data-theme=...] and not only a .dark class).
