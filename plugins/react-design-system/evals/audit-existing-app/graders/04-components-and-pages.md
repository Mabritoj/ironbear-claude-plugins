---
type: llm
focus: trace
weight: 1
---

docs/design-system-audit.md reports at least two of: IconButton's label prop is optional so header icon buttons have no accessible name; ProjectList navigates with Card onClick + navigate() instead of a link; the heading text is written in ALL CAPS ("PROJECTS"); ProjectList sets its own max-width (1080px).
