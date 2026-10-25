/**
 * Design-system rules for stylesheets -- the editor-time twin of
 * test/cssGuardrails.test.ts. Deliberately no `extends`: these rules only
 * enforce the token contract, so they sit next to whatever style config the
 * project already has (merge them into it if there is one).
 *
 * Raw values belong in src/styles/tokens.css only; everything else reads
 * var(--*). TEMPLATE: adjust the paths and the font-family pattern.
 */
const rawColorFunctions = ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color'];

export default {
  reportDescriptionlessDisables: true, // every exception says why
  rules: {
    'color-no-hex': [true, { message: 'Use a --color-* token from tokens.css' }],
    'color-named': ['never', { message: 'Use a --color-* token from tokens.css' }],
    'function-disallowed-list': [rawColorFunctions, { message: 'Use a --color-* token from tokens.css' }],
    'declaration-property-value-disallowed-list': [
      {
        // The one focus ring lives in global.css. For an input inside a
        // wrapper that draws a :focus-within ring, disable this rule on that
        // line with a reason.
        '/^outline(-style)?$/': ['none', '0'],
        // Families come from --font-* tokens only.
        'font-family': ['/^(?!var\\(--font-)/'],
      },
      { message: 'Use the global :focus-visible ring and --font-* tokens' },
    ],
  },
  overrides: [
    {
      files: ['src/styles/tokens.css'],
      rules: {
        'color-no-hex': null,
        'color-named': null,
        'function-disallowed-list': null,
        'declaration-property-value-disallowed-list': null,
      },
    },
  ],
};
