# Tokens

Template: `templates/styles/tokens.css` (and `global.css`, `typography.module.css`).

## Shape of the file

```css
:root {                      /* theme-independent scales */
  --font-sans: 'Inter', system-ui, sans-serif; /* all UI text */
  --text-md: 13px;           /* default UI text, buttons */
  --space-4: 16px;           /* card padding (sm), phone gutter */
  --radius-md: 8px;          /* buttons, inputs, menu items */
  --shadow-popover: 0 18px 44px rgb(0 0 0 / 0.3);
  --z-popover: 50;
  --duration-fast: 120ms;
}

:root,
[data-theme='light'] {       /* default theme first */
  color-scheme: light;
  --color-bg: #fafaf9;       /* page background */
  ...
}

[data-theme='dark'] {
  color-scheme: dark;
  --color-bg: #121110;
  ...
}
```

Why each choice:

- **One file.** People (and Claude) read one place to learn the system; the
  guardrail has one exemption; a design-system sync has one source.
- **One token per line with a trailing usage comment.** The comment answers
  *when* to use it ("needs attention, not an error"), which is what prevents
  two near-identical tokens being used interchangeably. Claude Design turns
  it into the token's usage note.
- **Literal values, or a plain `var(--other-color)` alias.** Keep
  `color-mix()` and `calc()` out of this file -- converters (and humans
  scanning for a value) can't resolve them. Compute in the component module
  instead: `background: color-mix(in srgb, var(--color-destructive) 18%, transparent);`.
- **`[data-theme]` selectors, not `:root[data-theme]`,** so a subtree can opt
  in. A subtree that does must set `color: var(--color-text)` on itself,
  because `color` inherits the computed value from outside.
- **`color-scheme` per theme** so native controls, scrollbars and the date
  picker match.

## Choosing the theme at runtime

`data-theme` on `<html>` decides the page theme; a subtree's own
`data-theme` still overrides it. Default to the OS setting, let the user
override it, and apply it **before first paint** -- setting it from a React
effect flashes the light theme on every dark-mode load. In `index.html`,
before the stylesheets:

```html
<script>
  try {
    var t = localStorage.getItem('theme');
    if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = t;
  } catch (e) {}
</script>
```

After load, `templates/utils/theme.ts` handles the rest:
`setThemePreference('system' | 'light' | 'dark')` for the settings control,
and `watchSystemTheme()` (call once at startup) so a 'system' preference
follows the OS when it switches. If the app keeps the preference in a store
or on the server, have that call `applyTheme` instead of using localStorage.
A strict Content-Security-Policy needs the inline script's hash allowed.

Without JavaScript the page stays on the first (default) theme block.

## Naming

| Family | Names | Notes |
| --- | --- | --- |
| Color | `--color-<role>[-<variant>]`: `bg`, `surface`, `surface-sunken`, `border`, `border-strong`, `overlay`, `text`, `text-muted`, `text-subtle`, `brand`, `brand-hover`, `brand-ink`, `warning`(+`-bg`), `success`(+`-bg`), `destructive`(+`-bg`), `focus-ring` | Role names. `-ink` = text on that fill. Pair each status color with a `-bg` tint. |
| Domain color | `--<thing>-<part>` e.g. `--illustration-sky-from` | Illustrations get their own tokens per theme instead of JS reading the theme store. |
| Font | `--font-sans`, `--font-mono` | The only place family names appear. |
| Size | `--text-xs ... --text-3xl`, `--text-display` | A t-shirt scale. Each line commented with its role. |
| Space | `--space-1..12` on a 4px base | Numbers = multiples of 4px. |
| Radius | `--radius-sm/md/lg/xl/full` | Controls md, surfaces lg. |
| Shadow | `--shadow-<use>`: `raised`, `popover`, `modal` | Named by use, not size. |
| Layer | `--z-floating < --z-popover < --z-modal` | Native `<dialog>` needs none (top layer). |
| Motion | `--duration-fast/base`, `--ease-standard` | |
| Layout | `--content-max-width` | Read only by `.app-container`. |

Avoid two tokens with overlapping meaning (`--color-danger` and
`--color-destructive` both existing led to low-stock warnings styled as
errors). When you find a pair like that, rename by role and migrate.

## Typography roles

`typography.module.css` defines roles -- `display`, `h1`, `h2`, `title`,
`body`, `bodySm`, `meta`, `label` (mono caps over a value), `eyebrow` (mono
caps over a section) -- each setting font size/weight/line-height/letter-
spacing only, plus separate tone classes (`muted`, `brand`, `warning`...)
for color. Roles never set color so a role never fights a tone. The `Text`
component applies them; any module can `composes: label from '../styles/typography.module.css';`.

## Adding a token

1. Check an existing token doesn't already mean it (grep the role).
2. Add it next to its family with a usage comment; for a color, add it to
   **every** theme block (a missing theme silently falls back to the first).
3. Text colors: 4.5:1 contrast against the surfaces their comment names, in
   every theme (3:1 for 24px+ text, control borders, focus rings, icons).
4. Use it. A token nobody reads is noise.

## Breakpoints

Literals by convention, documented at the top of `tokens.css`: `640px`
(phone: collapse nav, scale headlines) and `860px` (tablet: multi-column ->
one column). `var()` doesn't work inside `@media`.

## The guardrail

`templates/test/cssGuardrails.ts` + `.test.ts` scan every `.css` under `src/`
except `styles/tokens.css` and fail on:

- color literals (`#hex`, `rgb()`, `rgba()`, `hsl()`, `hsla()`),
- quoted font family names from `FONT_FAMILIES` (edit that list),
- `outline: none|0`, except a `:focus-visible` opt-out in a module that puts
  a `:focus-within` ring on a wrapper.

Comments are ignored, so `/* was #cf9161 */` is fine. The suite reads files
from disk, so it runs with `// @vitest-environment node` (under jsdom,
`import.meta.url` isn't a `file:` URL). Read files with `node:fs`, not Vite
`?raw` imports -- `?raw` on CSS goes through the CSS pipeline.

When introducing the guardrail into a drifted codebase, start with an
allowlist of current offenders (file -> expected counts) so it's green on
day one, and make shrinking the allowlist the migration's progress meter;
delete the allowlist when it's empty.
