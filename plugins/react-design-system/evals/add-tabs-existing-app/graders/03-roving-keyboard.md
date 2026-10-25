---
type: llm
focus: { source: file, path: src/components/Tabs.tsx }
weight: 1
---

PASS if only the selected tab is a tab stop (tabIndex 0 on it, -1 on the others) and Left/Right arrow keys move to the previous/next tab (wrapping or not) with Home/End jumping to the ends; it may use a shared hook such as useRovingSelection. FAIL if every tab is tabbable or there is no arrow-key handling.
