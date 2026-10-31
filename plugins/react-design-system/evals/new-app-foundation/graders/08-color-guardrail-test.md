---
type: regex
pattern: '(guard|css|token|style|color|lint)[^/\n]*\.test\.tsx?$'
target: files
flags: im
weight: 1
---

A test file whose name marks it as a stylesheet/color guardrail (e.g. cssGuardrails.test.ts) was created.
