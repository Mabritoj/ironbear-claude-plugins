---
type: llm
focus: last_message
weight: 1
---

PASS if the final message says how the initial theme is chosen (OS preference via prefers-color-scheme and/or a saved choice) and that it is applied before first paint (an inline script in index.html or equivalent), not only from a React effect. FAIL if the initial theme choice is not addressed or is applied only after React mounts.
