import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // React 17+ JSX transform does not require React to be in scope.
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
      // These effects start asynchronous API reads; they do not synchronously
      // derive state from props or state.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];
