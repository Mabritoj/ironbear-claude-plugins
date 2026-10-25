---
type: llm
focus: trace
weight: 1
---

The tooltip stays open while the pointer moves from the trigger onto the tooltip (it only hides when the pointer leaves both, on blur or on Escape), and when the tooltip text repeats an icon button's label it is not announced twice (aria-hidden on the tooltip, or the label comes from the tooltip via aria-labelledby instead of a separate aria-label).
