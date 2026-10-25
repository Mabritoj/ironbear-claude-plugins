---
type: llm
focus: last_message
weight: 1
---

PASS if the final message points out at least two existing design-system problems in the repo that it did not fix, e.g. hardcoded hex colors in Button.module.css, IconButton's optional label leaving icon-only buttons unnamed, button:focus { outline: none } in index.css, or hue-named tokens. FAIL if it mentions fewer than two, or says it rewrote those unrelated files.
