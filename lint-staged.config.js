module.exports = {
  // eslint-disable-next-line global-require
  ...require('@gpn-prototypes/frontend-configs/git/lint-staged.config'),
  '*.{md}': ['yarn lint:md'],
};
