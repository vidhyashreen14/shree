<<<<<<< HEAD
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
=======
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
>>>>>>> a821a0c (second update)

export default [
  // ── Global ignores ────────────────────────────────────────────────────────
  {
<<<<<<< HEAD
    ignores: ["node_modules", "dist", "build", "src/routeTree.gen.ts", ".tanstack"],
  },

  // ── Base JS rules ─────────────────────────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript + React files ──────────────────────────────────────────────
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // Browser globals (window, document, fetch, Blob, URL, etc.)
        ...globals.browser,
        // Node globals (used in vite.config.ts — __dirname, process, etc.)
        ...globals.node,
        // React global (for JSX without explicit import in some patterns)
        React: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // ── TypeScript ──────────────────────────────────────────────────────
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      // ── React ───────────────────────────────────────────────────────────
      "react/jsx-uses-react": "off", // Not needed with React 17+ JSX transform
      "react/react-in-jsx-scope": "off", // Not needed with React 17+ JSX transform
      "react/prop-types": "off", // TypeScript handles this
      "react/display-name": "warn",

      // ── React Hooks ─────────────────────────────────────────────────────
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // ── General Best Practices ───────────────────────────────────────────
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "prefer-const": "warn",
      eqeqeq: ["warn", "always"],

      // ── Turn off rules already handled by TypeScript compiler ────────────
      "no-undef": "off", // TypeScript handles undefined variables
      "no-unused-vars": "off", // Use @typescript-eslint/no-unused-vars instead
    },
  },

  // ── Plain JS / config files ───────────────────────────────────────────────
  {
    files: ["*.js", "*.mjs", "*.cjs", "vite.config.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
=======
    ignores: ['node_modules', 'dist', 'routeTree.gen.ts'],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },

    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,

      'react-refresh/only-export-components': 'off',
      'react-hooks/incompatible-library': 'off',
    },
  },

  eslintConfigPrettier,
>>>>>>> a821a0c (second update)
];
