---
type: llm
focus: { source: file, path: src/features/projects/ProjectList.tsx }
weight: 1
---

PASS if each project card navigates through a link (Card rendered with as={Link} to=..., or a Link/anchor inside or around it) and there is no onClick handler calling navigate(). FAIL if navigation still happens through onClick + navigate().
