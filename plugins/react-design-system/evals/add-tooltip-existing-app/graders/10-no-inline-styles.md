---
type: llm
focus: { source: file, path: src/components/Tooltip.tsx }
weight: 1
---

PASS if the component uses no inline style object, or only passes CSS custom properties through style (e.g. style={{ "--tooltip-anchor": value }}). FAIL if style sets ordinary CSS properties such as top, left, color or display.
