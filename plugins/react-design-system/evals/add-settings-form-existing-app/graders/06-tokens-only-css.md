---
type: tool_used
tool: Write
input_match: '"file_path"\s*:\s*"[^"]*/src/components/(Field|TextInput|TextArea|Textarea|Input|SubmitButton)[^"]*\.module\.css"[\s\S]*(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\()'
min: 0
max: 0
weight: 1
---

New form-control stylesheets contain no raw color literals.
