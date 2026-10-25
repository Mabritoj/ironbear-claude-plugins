---
type: llm
focus: { source: file, path: src/components/Tabs.tsx }
weight: 1
---

PASS if the component's API is either compound parts (e.g. Tabs, TabList, Tab, TabPanel as named exports sharing state through React context) or a data-driven items prop -- both are acceptable shapes. FAIL only if it finds or modifies its parts by inspecting children (React.Children.map / React.Children.toArray / cloneElement over children).
