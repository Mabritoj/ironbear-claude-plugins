# Testing a design system

## What every primitive's test covers

- **Smoke:** renders with defaults.
- **Semantics:** query by role and accessible name, not class or test id:
  `getByRole('button', { name: 'Save' })`, `getByLabelText('Name')`.
- **Variants that change behavior:** `to` renders a link with the right
  `href`; `loading` sets `disabled` and `aria-busy`; `error` on Field sets
  `aria-invalid` and `aria-describedby` to the error's id.
- **Keyboard:** for Tabs/Menu/SegmentedControl, arrows move focus and
  selection, Home/End jump, Escape returns focus.
- Don't assert class names or computed styles -- that's implementation, and
  jsdom doesn't apply CSS modules meaningfully. Visual checks belong in a
  browser.

## The CSS guardrail

Copy `templates/test/cssGuardrails.ts` and `cssGuardrails.test.ts` into
`src/test/`; set `FONT_FAMILIES`. The suite needs
`// @vitest-environment node` at the top and reads files with `node:fs`.
It makes "no raw colors, no raw fonts, no outline: none" a build failure,
which is the only thing that keeps a cleaned-up codebase clean.

## Lint rules

The guardrail test fails CI; lint rules flag the same problems in the
editor, while they're being written, and cover JSX the CSS test can't see.
Two templates, each a config to merge into what the project already has
(adding stylelint or ESLint plugins is a new dev dependency -- ask first):

- `templates/lint/stylelint.config.mjs` -- outside `tokens.css`: no hex,
  named colors or color functions (`rgb()`, `hsl()`, `oklch()`...), no
  `outline: none`, `font-family` only from `var(--font-*)`. `color-mix()`
  over tokens, `currentColor`, `transparent` and forced-colors system colors
  (`Highlight`, `CanvasText`) pass. Exceptions are a
  `/* stylelint-disable-next-line <rule> -- reason */` comment, and a disable
  without a reason is itself an error.
- `templates/lint/eslint.design-system.js` -- a flat-config fragment:
  `jsx-a11y` recommended (alt text, labels, valid ARIA), `react-hooks`
  recommended, and `no-restricted-syntax` rules that flag:
  - inline `style` objects with real CSS properties (custom properties like
    `{ '--swatch': hex }` pass) -- everywhere under `src/`;
  - raw `<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>` in
    feature and route folders -- use or extend a primitive;
  - `onClick` handlers calling `navigate()` in feature code -- use a link.

ESLint's `no-restricted-syntax` doesn't merge across config entries (a
later entry for the same files replaces it), which is why the feature-folder
entry repeats the inline-style selector. Keep both lists together when
editing. Checked against ESLint 10 and Stylelint 17; `eslint-plugin-jsx-a11y`
6.10 doesn't list ESLint 10 as a peer yet, so on 10 npm needs
`--legacy-peer-deps` (it works).

Keep the CSS guardrail test either way: it's the check CI can't skip, and it
needs no extra dependencies. In a drifted app, start the lint rules as
`warn`, or with the same allowlist idea as the guardrail, and flip to
`error` once a folder is migrated.

## Native dialog in jsdom

jsdom implements `<dialog>` but not `showModal()`/`close()`. Install
`templates/test/dialogShim.ts` from the test setup file:

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { installDialogShim } from './dialogShim';
installDialogShim();
```

The shim fires `close` **asynchronously**, like browsers. That matters: a
synchronous shim hides the StrictMode reopen bug described in `overlays.md`.
So when asserting on a close, `await waitFor(...)`. Simulate Escape with:

```ts
fireEvent(dialog, new Event('cancel', { cancelable: true }));
```

Top-layer rendering, focus trapping and inertness aren't emulated.

## Pitfalls that produced false greens

- **Vacuous negatives after an element change.** A button became a link;
  `expect(queryByRole('button', { name: 'Add project' })).toBeNull()` kept
  passing while the permission gate was broken. Re-point negatives at the
  new role, then break the behavior on purpose and watch the test fail.
- **Env-dependent tests.** Tests that read `VITE_*` values from a developer's
  `.env` fail on fresh clones and CI. Pin them in `vite.config.ts` `test.env`.
- **A regression test you haven't seen fail** proves nothing. For each bug
  fix, revert the fix locally, confirm red, restore.

## The catalog page

A dev-only route that renders every primitive, in every theme side by side:

```tsx
// App.tsx -- import.meta.env.DEV is a compile-time constant, so the chunk
// and route vanish from production builds.
const DesignCatalog = import.meta.env.DEV
  ? lazy(() => import('./routes/DesignCatalog').then((m) => ({ default: m.DesignCatalog })))
  : null;
...
{DesignCatalog && <Route path="/__design" element={<DesignCatalog />} />}
```

```tsx
export function DesignCatalog() {
  return (
    <div className={styles.page}>
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} data-theme={theme} className={styles.theme}>
          <Text variant="h1">{theme} theme</Text>
          <Catalog idPrefix={theme} />   {/* idPrefix keeps ids unique across the two copies */}
        </div>
      ))}
    </div>
  );
}
```

Each section shows one primitive's variants, sizes and states; form controls
and overlays are live (local `useState`) so focus, keyboard and the mobile
sheet can be checked. Look at it at 375px, 768px and desktop after any
primitive or token change. If the project later adopts Storybook (a new
dependency -- ask first), each catalog section maps to a story.

## Automated accessibility check

Role queries prove a primitive *can* be found by name; they don't catch low
contrast, missing names elsewhere, or invalid ARIA. Run axe against the
catalog page, which renders every primitive in both themes, so one scan
covers the whole system (`@axe-core/playwright` -- a new dev dependency,
ask first):

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('design catalog has no axe violations', async ({ page }) => {
  await page.goto('/__design');
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});
```

- Overlays are closed by default, so axe can't see their contents: open each
  one in the test (click the trigger) and scan again.
- Automated checks catch only part of WCAG (estimates run from about a
  third to about half of issues). Keyboard flow, focus order,
  focus return and screen-reader wording still need the keyboard tests above
  and a manual pass.
- With an existing drifted app, start with `.disableRules([...])` or an
  allowlist of today's violations, the same way the CSS guardrail starts.

## Browser verification

Use Playwright (or the project's e2e tool) for: both themes, phone/tablet/
desktop widths, horizontal-overflow check
(`document.documentElement.scrollWidth > innerWidth`), overlays' focus
behavior, and the two OS settings jsdom can't emulate:
`page.emulateMedia({ forcedColors: 'active' })` (selected/pressed states must
still be visible) and `page.emulateMedia({ reducedMotion: 'reduce' })`. For migrations, take before/after full-page screenshots of every
page and diff them: the only differences should be the ones you intended.
