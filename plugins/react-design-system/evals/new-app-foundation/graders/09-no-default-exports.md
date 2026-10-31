---
type: tool_used
tool: Write
input_match: '"file_path"\s*:\s*"[^"]*/src/components/[^"]*\.tsx"[\s\S]*export default'
min: 0
max: 0
weight: 1
---

Component files are written with named exports only (no export default).
