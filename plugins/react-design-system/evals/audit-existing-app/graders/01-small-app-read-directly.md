---
type: llm
focus: trace
weight: 1
---

The app is small (about 17 source files, under 300 lines), so the run measures drift itself by reading the files and/or running greps directly, and does not spawn the design-drift-auditor subagent.
