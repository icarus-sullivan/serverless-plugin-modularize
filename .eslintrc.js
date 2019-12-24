module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  parser: 'babel-eslint',
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  rules: {
    'arrow-parens': ['error', 'always'],
    'no-console': 0,
    'max-len': 0,
    'no-continue': 0,
    'no-restricted-syntax': 0,
    'no-prototype-builtins': 0,
    'import/prefer-default-export': 0,
    'global-require': 0,
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
        arrowParens: 'always',
      },
    ],
  },
};
