/* .eslintrc.cjs */
module.exports = {
  root: true,
  extends: [
    'next',
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
  plugins: ['@typescript-eslint', 'unused-imports'],
  rules: {
    // rimpiazza il preset con le regole dirette:
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
  'prefer-const': 'warn', // così eslint --fix converte let→const dove sicuro
  '@typescript-eslint/no-explicit-any': 'warn', // o 'off' se vuoi zero rumore
  'react/no-unescaped-entities': 'off',
  'react/display-name': 'off',
  '@typescript-eslint/no-unused-vars': [
    'warn',
    { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
  ],
  },
  overrides: [
    {
      files: ['components/calculators/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'off',
        'unused-imports/no-unused-vars': 'off',
        'react/no-unescaped-entities': 'off',
        'react/display-name': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'prefer-const': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/', '.next/', 'out/', 'build/', 'dist/', '.turbo/', '*.config.*'
  ],
};
