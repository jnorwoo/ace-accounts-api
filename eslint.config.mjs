// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';

export default tseslint.config(
  // Ignore build artifacts and the config file itself
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'eslint.config.*'],
  },

  // TypeScript files: type-aware rules
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
      'prefer-const': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
    },
  },

  // Jest tests (still TS, just add jest globals + a couple rules)
  {
    files: ['test/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    plugins: { jest: jestPlugin },
    languageOptions: {
      globals: { ...globals.jest, ...globals.node },
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'jest/no-focused-tests': 'error',
      'jest/no-disabled-tests': 'warn',
      'jest/expect-expect': 'warn',
    },
  },

  // Plain JS files: use default (Espree) parser + recommended JS rules
  {
    files: ['**/*.{js,cjs,mjs}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
);
