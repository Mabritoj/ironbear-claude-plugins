/**
 * Design-system lint rules for an ESLint flat config. Spread it into the
 * project's eslint.config.js after its own entries:
 *
 *   import designSystem from './eslint.design-system.js';
 *   export default [...existingConfig, ...designSystem];
 *
 * Needs eslint-plugin-jsx-a11y and eslint-plugin-react-hooks (most React
 * templates already include react-hooks). TEMPLATE: adjust the feature
 * globs to the project's folders.
 */
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';

const FEATURE_FILES = ['src/features/**/*.tsx', 'src/routes/**/*.tsx'];
const TEST_FILES = ['**/*.test.tsx', '**/*.test.ts'];

export default [
  {
    files: ['src/**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
  },
  {
    // Inline styles may only pass CSS custom properties (rule 9):
    // style={{ '--swatch': hex }} is fine, style={{ color: hex }} is not.
    files: ['src/**/*.tsx'],
    ignores: TEST_FILES,
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='style'] ObjectExpression > Property[key.type='Identifier']",
          message: "Inline styles only pass custom properties (style={{ '--name': value }}); put styling in the CSS module.",
        },
      ],
    },
  },
  {
    // Feature code composes primitives instead of hand-styling controls (rule 3),
    // and anything that navigates is a link (rule 4).
    files: FEATURE_FILES,
    ignores: TEST_FILES,
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='style'] ObjectExpression > Property[key.type='Identifier']",
          message: "Inline styles only pass custom properties (style={{ '--name': value }}); put styling in the CSS module.",
        },
        {
          selector: 'JSXOpeningElement[name.name=/^(button|input|select|textarea|dialog)$/]',
          message: 'Use the design-system primitive (Button, IconButton, TextInput, Select, Modal...) or extend one.',
        },
        {
          selector: "JSXAttribute[name.name='onClick'] CallExpression[callee.name='navigate']",
          message: 'Navigation is a link: use Button/Card with `to`, not onClick + navigate().',
        },
      ],
    },
  },
];
