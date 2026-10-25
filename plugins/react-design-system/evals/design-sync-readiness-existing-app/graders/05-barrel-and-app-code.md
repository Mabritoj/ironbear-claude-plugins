---
type: llm
focus: { source: file, path: readiness.md }
weight: 1
---

PASS if the document flags BOTH the missing src/components/index.ts barrel AND that ProjectHeader (app code using the store) sits in components/ and must stay out of the design-system inventory. FAIL if either is missing.
