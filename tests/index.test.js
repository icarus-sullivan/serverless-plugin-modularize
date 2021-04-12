import Modularize from '../src/index';
import fs from 'fs';

const createServerless = ({ custom } = {}) => ({
  service: {
    custom: custom || {
      foo: 'bar',
    },
  },
  cli: {
    consoleLog: jest.fn(),
  },
  utils: {
    readFileSync: fs.readFileSync 
  }
});

const createModularize = (sls) => {
  const plugin = new Modularize(sls);
  plugin.mergeModules();
  return plugin;
};

describe('Modularize', () => {
  it('ignored when missing globs', () => {
    const serverless = createServerless();
    createModularize(serverless);

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
