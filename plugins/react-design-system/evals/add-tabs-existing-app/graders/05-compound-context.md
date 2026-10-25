---
type: llm
focus: { source: file, path: src/components/Tabs.tsx }
weight: 1
---

PASS if the parts (e.g. Tabs, TabList, Tab, TabPanel) are separate named exports that share state through React context, and the component does not find its parts by inspecting children (React.Children.map / cloneElement over children). FAIL if it uses child inspection, or is a single component driven by an items array with no way to compose parts.
