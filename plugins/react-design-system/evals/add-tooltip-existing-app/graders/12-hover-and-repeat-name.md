---
type: llm
focus: { source: file, path: src/components/Tooltip.tsx }
weight: 1
---

PASS if both hold: (1) moving the pointer from the trigger onto the tooltip does not close it -- it closes only when the pointer leaves both (e.g. the handlers are on a wrapper containing both, or a short close delay that the tooltip cancels), on blur, or on Escape; (2) when the tooltip repeats the trigger's label it is not announced twice (aria-hidden, or the trigger is named by the tooltip via aria-labelledby instead of a separate aria-label). FAIL if either is missing.
