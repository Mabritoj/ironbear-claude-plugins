---
type: regex
pattern: '(could(n[\x27’]t| not)|have(n[\x27’]t| not)|did(n[\x27’]t| not)|unable to|was(n[\x27’]t| not) able to)[^.\n]{0,80}\b(run|test|typecheck|tsc|install)|\b(tests?|typecheck|tsc)\b[^.\n]{0,60}\b(pass(ed|ing)?|green)\b'
target: last_message
flags: i
weight: 1
---

The final message says whether the tests and typecheck ran: either that they passed, or that they could not be run (and why).
