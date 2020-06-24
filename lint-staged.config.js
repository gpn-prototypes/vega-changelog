module.exports = {
  ...require('@gpn-prototypes/frontend-configs/git/lint-staged.config'),
  '*.{md}': ['yarn lint:md'],
};
