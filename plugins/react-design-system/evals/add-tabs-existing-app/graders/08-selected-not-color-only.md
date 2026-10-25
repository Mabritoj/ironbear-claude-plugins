---
type: llm
focus: { source: file, path: src/components/Tabs.module.css }
weight: 1
---

PASS if the selected tab is indicated by something other than a background color alone -- a border, underline, outline, font weight, or a forced-colors media rule -- so it stays visible in Windows High Contrast mode. FAIL if the only difference is background or text color.
