const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');

module.exports = defineConfig([
  ...expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.expo/**',
      'android/**',
      'ios/**',
      '.agents/**',
      '.claude/**',
      '.scratch/**',
    ],
  },
  {
    rules: {
      // Reanimated 4 SharedValue `.value = ...` and PanResponder ref patterns trigger
      // React Compiler strictness rules despite being intentional in React Native.
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react/display-name': 'off',
    },
  },
  {
    files: [
      'eslint.config.js',
      'jest.config.js',
      'babel.config.js',
      'metro.config.js',
      'app.config.js',
      'scripts/**/*.js',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['tests/**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['tests/components/**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]);
