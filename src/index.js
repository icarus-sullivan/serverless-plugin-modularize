const get = require('lodash.get');
const glob = require('glob');

const mergeTest = require('./utils/merge');

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
    this.resolve = filename => this.serverless.utils.readFileSync(filename);

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

  getSubset() {
    return {
      plugins: get(this.serverless, 'service.plugins', []),
      custom: get(this.serverless, 'service.custom', {}),
      provider: get(this.serverless, 'service.provider', {}),
      functions: get(this.serverless, 'service.functions', {}),
      resources: get(this.serverless, 'service.resources', {}),
    };
  }

  printInfo() {
    for (const file of this.files) {
      this.log(file, '\n', JSON.stringify(this.resolve(file), null, 2), '\n');
    }
  }

  printMerged() {
    const subset = this.getSubset();

    this.log(JSON.stringify(subset, null, 2));
  }

  mergeModules() {
    const subset = this.getSubset();

    const mergedValues = [subset, ...this.files.map(this.resolve)].reduce(
      mergeTest,
      {},
    );

    Object.assign(this.serverless.service, mergedValues);
  }

  processCustom() {
    const c = get(this.serverless, 'service.custom');
    const match = FILE_REGEX.exec(c);
    if (match && match[0]) {
      const filename = match[0].slice(1, -1);

      Object.assign(this.serverless.service, {
        custom: this.resolve(filename),
      });
    }
  }
}

module.exports = Modularize;
