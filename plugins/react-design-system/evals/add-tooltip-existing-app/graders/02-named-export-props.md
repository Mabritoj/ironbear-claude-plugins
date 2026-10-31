---
type: regex
pattern: 'export\s+(interface|type)\s+TooltipProps[\s\S]*export\s+function\s+Tooltip\s*\(\s*\{'
target: { source: file, path: src/components/Tooltip.tsx }
weight: 1
---

Tooltip.tsx exports a TooltipProps type and a named `export function Tooltip({ ... })` with props destructured in the signature.
