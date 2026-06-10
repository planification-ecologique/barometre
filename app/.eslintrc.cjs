module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
    'vue/setup-compiler-macros': true,
  },
  globals: {
    tarteaucitron: 'readonly',
    tarteaucitronForceLanguage: 'readonly',
    _EA_disabled: 'readonly',
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-mixed-spaces-and-tabs': 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-components': 'off',
    'vue/require-v-for-key': 'warn',
    'vue/no-mutating-props': 'warn',
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: {
        jest: true,
      },
    },
  ],
};
