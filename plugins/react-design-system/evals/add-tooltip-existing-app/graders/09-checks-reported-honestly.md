---
type: llm
focus: last_message
weight: 1
---

PASS if the final message either reports the test suite and the typecheck (tsc --noEmit / npm run typecheck) passing, or clearly says they could not be run and why. FAIL if it claims checks passed without saying they ran, or does not mention verification at all.
