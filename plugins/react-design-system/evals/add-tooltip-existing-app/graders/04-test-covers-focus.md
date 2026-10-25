---
type: llm
focus: { source: file, path: src/components/Tooltip.test.tsx }
weight: 1
---

PASS if at least one test focuses the trigger (focus(), fireEvent.focus, userEvent.tab or similar) and asserts the tooltip text becomes visible/present. FAIL if focus showing the tooltip is never tested.
