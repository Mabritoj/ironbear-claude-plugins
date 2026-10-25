---
type: llm
focus: { source: file, path: src/components/Tabs.tsx }
weight: 1
---

PASS if Tabs works both controlled (a value prop plus a change callback such as onValueChange) and uncontrolled (a defaultValue, managing its own state). FAIL if it supports only one of the two modes.
