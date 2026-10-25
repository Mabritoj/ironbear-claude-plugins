# Mapping to a Claude Design System

A **Claude Design System** is a claude.ai artifact made from the published
"Design System" artifact type. It holds a brand's README, tokens, components
with live previews, and assets as files under `project/`, hosted with the
artifact (not in the repo). Claude reads it before making decks, mockups and
pages, so designs match the product. It can be built from a repository and
re-synced when the code changes (Claude Code's `/design-sync`, or the type's
"from code" procedure).

The authoritative spec is the type's own files -- read them with the
Artifact tool before building one: `SKILL.md`, then
`artifact-type/reference/format.md` and `artifact-type/reference/from-code.md`
(find the type with `Artifact list scope:"types" type_query:"design system"`).
The summary below is what a **codebase** should look like so that conversion
is mechanical. Re-check the spec if anything here disagrees with it: it
changes faster than this skill.

## What the converter reads from code -> what it becomes

| In the repo | In the design system | Write it like this |
| --- | --- | --- |
| CSS custom properties in one file, under `:root` + theme selectors | `project/tokens.json`: `color.themes` (one per selector) + token lists | `:root`/light block first; `[data-theme="dark"]`, `.dark` or a `prefers-color-scheme: dark` block become `dark` |
| `--name: value;` | token `name` (without `--`) + `value` | Literal values. Colors: hex / `rgb()` / `rgba()` / `hsl()` / `oklch()` with plain numbers, or `var(--other-color)` (-> alias `{other-color}`). **`calc()`, `color-mix()`, named colors (`transparent`, `currentColor`) are skipped.** |
| A comment on the token's line | token `usage` | `--color-warning: #d98a6a; /* needs attention, not an error */` |
| Name stems | the token family | `--color-*` -> color; `space`/`gap`/`pad` -> spacing; `radius`/`rounded` -> radius; `shadow` -> shadow; font sizes / line heights / weights -> type styles; font stacks -> `type.families` |
| `@font-face` + local font files | `fonts/<file>` + `type.fonts[]` | <= 1 MB each. Google-hosted fonts are fine: named in `type.families`, no file |
| SVG/PNG under `logo`, `brand`, `icons` folders | `assets/Logos/`, `assets/Icons/` | Real files. A logo drawn only inside a TSX component won't be found; keep a canonical `src/assets/brand/<name>-mark.svg` and have the component render the same paths |
| The library entry's PascalCase named exports (`components/index.ts`) | the component inventory | A barrel of primitives only |
| `*.stories.*`, per-component `.md`/`.mdx` | `components/<Comp>/README.md` + `preview.html` | First sentence = summary; when to use; what the consumer supplies; props |
| `.d.ts` / exported prop interfaces | `components/index.d.ts` (props docs) | `{Comp}Props` interfaces with JSDoc |
| The repo README and brand docs | `project/README.md` (the brand book) + extra `*.md` sections | Usage rules that **name tokens**, not install steps |

## Repo checklist for a clean sync

- [ ] `src/styles/tokens.css` is the only token source, one token per line,
      each with a usage comment.
- [ ] No `color-mix()`/`calc()`/named colors in `tokens.css` (compute those
      in component modules).
- [ ] Default (light or `:root`) theme first; every color defined in every theme.
- [ ] Text-color tokens meet 4.5:1 on the surfaces their comment names, in
      every theme (3:1 for 24px+, borders, focus rings, icons). The design
      system's checklist flags failing pairs.
- [ ] Typography roles named and paired (size + line height + weight) in
      `typography.module.css` or as tokens.
- [ ] `src/components/index.ts` barrel exporting only the primitives.
- [ ] Each primitive: JSDoc summary sentence on the component, JSDoc on
      non-obvious props, exported `{Comp}Props`.
- [ ] Per-component docs: `Button.md` (or `components/Button/README.md`)
      and/or a story/preview file per component. The `/__design` catalog
      page alone can't be split into per-component previews.
- [ ] Brand assets as files under `src/assets/brand/` (and icons, if they
      exist as files).
- [ ] A short `src/styles/README.md` (or `docs/brand.md`): voice, color
      roles, type roles, spacing rhythm, iconography, do/don't -- naming
      tokens and primitives. Agent files (CLAUDE.md, AGENTS.md) are refused
      by the type, so brand rules that live only there don't sync.
- [ ] Every token family that's defined is actually used. A `--space-*`
      scale nobody reads publishes a spacing system the app doesn't follow
      (grep `var(--space-` before syncing).
- [ ] Nothing reachable from the barrel imports app code (API clients,
      stores, auth SDKs, `features/`): a preview frame has no providers and
      would crash. Keep app composites (headers, profile menus, route guards)
      out of `components/` or at least out of the barrel.
- [ ] Global rules the primitives depend on (the `:focus-visible` ring,
      body font/color, link colors) live in a base stylesheet the bundle can
      ship -- separate from `tokens.css`, which the design system generates
      itself from `tokens.json`.
- [ ] Motion tokens and breakpoints are written down in the README: the
      format has no motion family and breakpoints can't be tokens.

## How the pieces map for a typical repo

```
src/styles/tokens.css              -> project/tokens.json (color themes, spacing, radius, shadow, other families)
src/styles/typography.module.css   -> tokens.json type.groups[].styles
src/styles/README.md               -> project/README.md
src/assets/brand/*.svg             -> project/assets/Logos/*  (uploaded, recorded in the index)
src/components/index.ts            -> component inventory
src/components/Button.md           -> project/components/Button/README.md
src/components/Button.stories.tsx  -> project/components/Button/preview.html (default story + variants)
built bundle (optional)            -> project/components/bundle.js (+ bundle.css, index.d.ts)
```

Live previews need the components built as **one classic IIFE script**
assigning `window.<Namespace>` and reading `window.React`/`window.ReactDOM`
(e.g. esbuild `--format=iife` with react resolved to globals). The converter
only runs a build with the user's go-ahead; without one, components get a
README and props docs with static or no previews.

Two things that block live previews and are easy to miss:

- **React version.** Previews load React 18 by default. Primitives written
  for React 19 (`ref` as a plain prop, no `forwardRef`) mount under 18 with
  refs silently dropped, and React 19 ships no UMD build to drop into
  `components/lib/` -- a project on 19 needs its own build step producing
  classic-script React globals, listed in the index's `libraries`.
- **Router coupling.** React Router `Link`s inside primitives throw without
  a router. Either bundle react-router plus a `MemoryRouter` wrapper into the
  previews, or invert the dependency: primitives render links through a
  link component from context that defaults to `<a href>`, and the app
  provides the router `Link`. The second keeps the design system router-free,
  which suits a long-lived sync.

Also list the contrast failures the type will flag (it keeps failing pairs
and marks them) so the user can decide on them before the first sync -- a
contrast fix changes how the app looks, so it's their call.

## tokens.json shape (for reference)

```json
{
  "name": "Acme",
  "color": {
    "themes": [{ "id": "dark", "name": "Dark" }, { "id": "light", "name": "Light" }],
    "tokens": [
      { "name": "color-bg", "value": { "dark": "#121110", "light": "#faf8f3" }, "usage": "Page background." },
      { "name": "color-focus-ring", "value": "{color-brand}", "usage": "Global :focus-visible outline." }
    ]
  },
  "type": {
    "families": { "sans": "\"Hanken Grotesk\", system-ui, sans-serif" },
    "groups": [{ "name": "Text", "family": "sans", "styles": [{ "name": "body", "fontSize": "14px", "lineHeight": 1.55, "fontWeight": 500 }] }]
  },
  "spacing": { "tokens": [{ "name": "space-4", "value": "16px", "usage": "Card padding (sm)." }] },
  "radius": { "tokens": [{ "name": "radius-md", "value": "9px", "usage": "Buttons, inputs." }] }
}
```

Every family but `type` is a **list** of `{name, value, usage}` -- the
nested W3C/DTCG map format isn't readable by the page. Names are unique
across families. Families like `zIndex` or `duration` are allowed as extra
`{tokens: [...]}` keys; motion has no dedicated family.

## When the user asks to build or sync one

Don't write `project/` files from this skill's summary. Read the type's
`SKILL.md` and `from-code.md` and follow them (they cover creating the
artifact, uploads, the index written last, and the re-sync merge rules). Use
this file only to get the repo into shape first, and to explain to the user
why each change helps the sync.
