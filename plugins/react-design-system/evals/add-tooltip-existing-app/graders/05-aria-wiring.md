---
type: llm
focus: { source: file, path: src/components/Tooltip.tsx }
weight: 1
---

PASS if either (a) the tooltip element has role="tooltip" and an id (from useId or equivalent) that the trigger references with aria-describedby or aria-labelledby, or (b) for a tooltip that only repeats the trigger's existing label, the tooltip is aria-hidden so it is not announced twice. Supporting both modes also passes. FAIL if the tooltip text is neither linked to the trigger nor hidden from assistive tech.
