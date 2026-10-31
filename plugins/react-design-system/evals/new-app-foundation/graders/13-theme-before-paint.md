---
type: llm
focus: last_message
weight: 1
---

PASS if the final message says how the initial theme is chosen (OS preference via prefers-color-scheme and/or a saved choice) and either applies it before first paint (an inline script in index.html or equivalent) or explicitly says such a pre-paint script is still needed (index.html is outside src/, which the prompt limited writes to). FAIL if the initial theme choice is not addressed, or it is applied only from a React effect with no mention of the flash.
