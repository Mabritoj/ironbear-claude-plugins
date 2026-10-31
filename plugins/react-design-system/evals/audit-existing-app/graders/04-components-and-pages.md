---
type: llm
focus: { source: file, path: docs/design-system-audit.md }
weight: 1
---

PASS if the document reports at least two of: IconButton's label prop is optional so header icon buttons have no accessible name; ProjectList navigates with Card onClick + navigate() instead of a link; the heading text is written in ALL CAPS ("PROJECTS"); ProjectList sets its own max-width (1080px). FAIL otherwise.
