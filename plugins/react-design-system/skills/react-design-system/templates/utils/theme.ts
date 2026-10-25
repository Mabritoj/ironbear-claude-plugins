/**
 * Which [data-theme] the page uses. 'system' follows the OS setting;
 * 'light' / 'dark' are the user's explicit choice, kept in localStorage.
 * The inline script in index.html (see references/tokens.md) applies the same
 * logic before first paint, so the page never flashes the wrong theme; this
 * module handles changes after load.
 */
export type ThemePreference = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme'; // TEMPLATE: must match the key the index.html script reads

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage can be blocked (private mode, sandboxed iframes): fall back to the OS.
  }
  return 'system';
}

export function resolveTheme(preference: ThemePreference): Theme {
  return preference === 'system' ? systemTheme() : preference;
}

export function applyTheme(preference: ThemePreference): void {
  document.documentElement.dataset.theme = resolveTheme(preference);
}

/** Saves the user's choice ('system' clears it) and applies it. */
export function setThemePreference(preference: ThemePreference): void {
  try {
    if (preference === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Not persisted, but still applied for this page view.
  }
  applyTheme(preference);
}

/** Follows OS theme changes while the preference is 'system'. Returns an unsubscribe. */
export function watchSystemTheme(): () => void {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => {
    if (readThemePreference() === 'system') applyTheme('system');
  };
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
