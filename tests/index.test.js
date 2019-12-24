import Modularize from '../src/index';

const createServerless = ({ custom } = {}) => ({
  service: {
    custom: custom || {
      foo: 'bar',
    },
  },
  cli: {
    consoleLog: jest.fn(),
  },
});

const createModularize = (sls) => {
  const plugin = new Modularize(sls);
  plugin.mergeModules();
  return plugin;
};

describe('Modularize', () => {
  it('ignored when missing globs', () => {
    const serverless = createServerless();
    const plugin = createModularize(serverless);

    expect(serverless).toMatchSnapshot();
  });

  it('merges external files', () => {
    const serverless = createServerless({
      custom: {
        modularize: {
          glob: '**/example.json',
        },
      },
    });
    createModularize(serverless);
    expect(serverless).toMatchSnapshot();
  });
});
