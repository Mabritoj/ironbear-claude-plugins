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

## Browser verification

Use Playwright (or the project's e2e tool) for: both themes, phone/tablet/
desktop widths, horizontal-overflow check
(`document.documentElement.scrollWidth > innerWidth`), overlays' focus
behavior. For migrations, take before/after full-page screenshots of every
page and diff them: the only differences should be the ones you intended.
