import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/', 'allure-*/', 'playwright-report/', 'test-results/', '.deepeval/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      // Playwright fixtures are destructured for their side effects.
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
      'no-empty-pattern': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='waitForTimeout']",
          message: 'Hardcoded waits are banned — use a web-first assertion or an explicit wait condition.',
        },
      ],
    },
  },
  {
    files: ['tests/perf/**/*.js'],
    languageOptions: { globals: { __ENV: 'readonly', __VU: 'readonly', __ITER: 'readonly' } },
  },
);
