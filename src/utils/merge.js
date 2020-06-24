const get = require('lodash.get');

module.exports = (a, b) => ({
  plugins: [...get(a, 'plugins', []), ...get(b, 'plugins', [])],
  custom: {
    ...get(a, 'custom', {}),
    ...get(b, 'custom', {}),
  },
  provider: {
    ...get(a, 'provider', {}),
    ...get(b, 'provider', {}),
  },
  functions: {
    ...get(a, 'functions', {}),
    ...get(b, 'functions', {}),
  },
  resources: {
    Resources: {
      ...get(a, 'resources.Resources', {}),
      ...get(b, 'resources.Resources', {}),
    },
    Outputs: {
      ...get(a, 'resources.Outputs', {}),
      ...get(b, 'resources.Outputs', {}),
    },
  },
});
