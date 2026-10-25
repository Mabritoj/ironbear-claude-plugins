---
type: regex
pattern: '/(Stat|ColorInput|NumberInput|Modal|ConfirmDialog|Menu|Tabs|Toast|Tooltip|Popover|Select|Badge|Chip|Switch|Checkbox)\.tsx$'
target: files
flags: m
match: not_contains
weight: 1
---

No broad set of unrequested components (Modal, Menu, Tabs, Toast, Stat, ...) is scaffolded; the prompt asked for tokens, Button, Card and a guardrail.
