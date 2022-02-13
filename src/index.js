const get = require('lodash.get');
const glob = require('glob');
const { clean } = require('@teleology/fp');
// merge for local merge output, not for serverless
const merge = require('lodash.merge');
const { resolve } = require('./utils/fs');

const {
  PLUGIN,
  IDENTIFIER_COLOR,
  IDENTIFIER,
  COLOR_RESET,
} = require('./config');

class Modularize {
  constructor(sls) {
    this.serverless = sls;

    this.resolve = (filename) => {
      try {
        return resolve(filename);
      } catch (e) {
        return this.serverless.utils.readFileSync(filename);
      }
    };

    this.hooks = {
      [`${PLUGIN}:info:info`]: this.printInfo.bind(this),
      [`${PLUGIN}:merged:merged`]: this.printMerged.bind(this),
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

  getSubset() {
    return clean({
      plugins: get(this.serverless, 'service.plugins', []),
      custom: get(this.serverless, 'service.custom', {}),
      provider: get(this.serverless, 'service.provider', {}),
      functions: get(this.serverless, 'service.functions', {}),
      resources: get(this.serverless, 'service.resources', {}),
    });
  }

  printInfo() {
    for (const file of this.files) {
      this.log(file, '\n', JSON.stringify(this.resolve(file), null, 2), '\n');
    }
  }

  printMerged() {
    const subset = this.files.reduce(
      (c, file) => merge(c, this.resolve(file)),
      this.getSubset(),
    );
    this.log(JSON.stringify(subset, null, 2));
  }

  mergeModules() {
    for (const file of this.files) {
      const content = this.resolve(file);
      this.serverless.service.update(content);
    }
  }
}

module.exports = Modularize;
