---
tags: [react-design-system]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

I'm starting a new React 19 + TypeScript app (Vite, CSS Modules, react-router, Vitest). Before we build any pages, set up the styling foundation so it doesn't drift like my last project did: design tokens with a light and a dark theme, a Button that can also act as a router link or an external link, a Card whose HTML element can change (section, li, a Link), and whatever keeps people from hardcoding colors later. Write the files under src/ in the current directory - no need to npm install.
