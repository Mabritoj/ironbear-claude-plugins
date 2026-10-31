---
type: llm
focus: { source: file, path: src/components/Tooltip.tsx }
weight: 1
---

PASS if the component shows the tooltip when its trigger receives keyboard focus (not only on hover/mouseenter) and hides it when Escape is pressed. FAIL if it only reacts to mouse/pointer events, or Escape does nothing.
