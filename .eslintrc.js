module.exports = {
  extends: [
    require.resolve('@gpn-prototypes/frontend-configs/eslintrc')
  ],
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    'global-require': 'off',
    'import/no-dynamic-require': 'off'
  }
};
