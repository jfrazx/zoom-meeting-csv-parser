module.exports = {
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 9,
  },
  rules: {
    'array-bracket-spacing': [2, 'never'],
    'block-scoped-var': 2,
    'brace-style': [
      2,
      '1tbs',
      {
        allowSingleLine: true,
      },
    ],
    camelcase: 0,
    'computed-property-spacing': [2, 'never'],
    curly: 2,
    'eol-last': 2,
    eqeqeq: [2, 'smart'],
    'max-depth': [1, 3],
    'max-len': [1, 90],
    'max-statements': [1, 15],
    'new-cap': 1,
    'no-extend-native': 2,
    'no-mixed-spaces-and-tabs': 2,
    'no-trailing-spaces': 2,
    'no-unused-vars': 1,
    'no-use-before-define': [2, 'nofunc'],
    'object-curly-spacing': [2, 'always'],
    quotes: [2, 'single', 'avoid-escape'],
    semi: [2, 'always'],
    'keyword-spacing': [
      2,
      {
        before: true,
        after: true,
      },
    ],
    'space-unary-ops': 2,
  },
};
