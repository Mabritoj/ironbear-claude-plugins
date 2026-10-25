---
type: llm
focus: { source: file, path: src/features/projects/ProjectList.module.css }
weight: 1
---

Look at the class the page passes to Card (originally `.card` with padding: 20px and cursor: pointer). PASS if that class is removed, or now only sets layout (grid placement, width, margin) and no padding, color, border, radius or font. If the file has no such class at all, PASS. FAIL if a class passed to Card still sets padding, color, border, radius or font.
