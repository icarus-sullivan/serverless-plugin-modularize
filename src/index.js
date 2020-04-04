const get = require('lodash.get');
const deepmerge = require('deepmerge');
const glob = require('glob');
const { resolve } = require('./utils/fs');

const {
  PLUGIN,
  IDENTIFIER_COLOR,
  IDENTIFIER,
  COLOR_RESET,
  FILE_REGEX,
} = require('./config');

class Modularize {
  constructor(sls) {
    this.serverless = sls;

    this.hooks = {
      [`${PLUGIN}:info:info`]: this.generateInfo.bind(this),
      [`${PLUGIN}:merged:merged`]: this.generateMerged.bind(this),
    };

    this.commands = {
      [PLUGIN]: {
        usage: 'Merging modularized serverless components',
        lifecycleEvents: [PLUGIN],
        commands: {
          merged: {
            usage: 'Display merged modules',
            lifecycleEvents: ['merged'],
          },
          info: {
            usage: 'Display modular file(s) information',
            lifecycleEvents: ['info'],
          },
        },
      },
    };

    this.processCustom();
    const options = get(this.serverless, 'service.custom.modularize');
    if (!options || !options.glob) {
      this.files = [];
      return;
    }

    this.files = glob.sync(options.glob);
    this.mergeModules();
  }

  log(...args) {
    this.serverless.cli.consoleLog(
      [`${IDENTIFIER_COLOR}${IDENTIFIER}${COLOR_RESET}`, ...args].join(' '),
    );
  }

  generateInfo() {
    for (const file of this.files) {
      this.log(file, '\n', JSON.stringify(resolve(file), null, 2), '\n');
    }
  }

  generateMerged(log = true) {
    const subset = {
      plugins: get(this.serverless, 'service.plugins', []),
      custom: get(this.serverless, 'service.custom', {}),
      provider: get(this.serverless, 'service.provider', {}),
      functions: get(this.serverless, 'service.functions', {}),
      resources: get(this.serverless, 'service.resources', {}),
    };

    const customMerge = (key) => {
      if (key.indexOf(':') > 0) {
        return (a, b) => a;
      }
    };

    const mergedValues = this.files
      .map(resolve)
      .concat(subset)
      .reduce(
        (a, b) =>
          deepmerge(a, b, {
            customMerge,
          }),
        {},
      );

    if (log) {
      this.log(JSON.stringify(mergedValues, null, 2));
    }

    return mergedValues;
  }

  processCustom() {
    const c = get(this.serverless, 'service.custom');
    const match = FILE_REGEX.exec(c);
    if (match && match[0]) {
      const filename = match[0].slice(1, -1);

      Object.assign(this.serverless.service, {
        custom: resolve(filename),
      });
    }
  }

  mergeModules() {
    Object.assign(this.serverless.service, this.generateMerged(false));
  }
}

module.exports = Modularize;
