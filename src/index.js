const ld = require('lodash');
const glob = require('glob');
const { clean } = require('@teleology/fp');
// merge for local merge output, not for serverless
const { resolve } = require('./utils/fs');

const {
  PLUGIN,
  IDENTIFIER_COLOR,
  IDENTIFIER,
  COLOR_RESET,
} = require('./config');

const customizer = (o, src) => {
  if (ld.isArray(o)) return o.concat(src);
};

class Modularize {
  constructor(sls) {
    this.serverless = sls;

    const options = ld.get(this.serverless, 'service.custom.modularize');
    if (!options || !options.glob) {
      this.files = [];
      return;
    }

    this.files = glob.sync(options.glob);
    // this.mergeModules();

    this.resolve = (filename) => {
      try {
        return resolve(filename);
      } catch (e) {
        return this.serverless.utils.readFileSync(filename);
      }
    };

    this.hooks = {
      initialize: () => this.mergeModules(),
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
  }

  log(...args) {
    this.serverless.cli.consoleLog(
      [`${IDENTIFIER_COLOR}${IDENTIFIER}${COLOR_RESET}`, ...args].join(' '),
    );
  }

  printInfo() {
    for (const file of this.files) {
      this.log(file, '\n', JSON.stringify(this.resolve(file), null, 2), '\n');
    }
  }

  printMerged() {
    const subset = this.files.reduce(
      (c, file) => ld.mergeWith(c, this.resolve(file), customizer),
      undefined,
    );
    this.log(JSON.stringify(subset, null, 2));
  }

  mergeModules() {
    const subset = this.files.reduce(
      (c, file) => ld.mergeWith(c, this.resolve(file), customizer),
      undefined,
    );

    ld.merge(this.serverless.service, subset);
    ld.merge(this.serverless.service.initialServerlessConfig, subset);

    this.serverless.service.getAllFunctions().forEach((functionName) => {
      const functionObj = this.serverless.service.getFunction(functionName);
      functionObj.events = functionObj.events || [];
    });
  }
}

module.exports = Modularize;
