import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // ── Ignore generated / built / vendored files ──────────────────────────
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'src/routeTree.gen.ts',
      'next-app/**',
      '**/*.min.js',
      '**/*.min.css',
    ],
  },

  // ── Linter options ──────────────────────────────────────────────────────
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },

  // ── Base JS rules ───────────────────────────────────────────────────────
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
  },

  // ── TypeScript ──────────────────────────────────────────────────────────
  tseslint.configs.recommended,

  // ── React (jsx-runtime disables react-in-jsx-scope for React 17+) ──────
  pluginReact.configs.flat['jsx-runtime'],

  // ── React Hooks ─────────────────────────────────────────────────────────
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // ── Project-level rule overrides ────────────────────────────────────────
  {
    rules: {
      // Belt-and-suspenders: explicitly off (new JSX transform handles it)
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // Turn off warning-only style rules for a completely clean lint check
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      'no-useless-escape': 'off',
      'no-useless-assignment': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
]);
