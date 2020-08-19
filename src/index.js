const get = require('lodash.get');
const glob = require('glob');
const merge = require('ramda').mergeDeepWithKey;
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

  generateInfo() {
    for (const file of this.files) {
      this.log(file, '\n', JSON.stringify(resolve(file), null, 2), '\n');
    }
  }

  printMerged() {
    const subset = {
      plugins: get(this.serverless, 'service.plugins', []),
      custom: get(this.serverless, 'service.custom', {}),
      provider: get(this.serverless, 'service.provider', {}),
      functions: get(this.serverless, 'service.functions', {}),
      resources: get(this.serverless, 'service.resources', {}),
    };

    this.log(JSON.stringify(subset, null, 2));
  }

  mergeModules() {
    const subset = {
      plugins: get(this.serverless, 'service.plugins', []),
      custom: get(this.serverless, 'service.custom', {}),
      provider: get(this.serverless, 'service.provider', {}),
      functions: get(this.serverless, 'service.functions', {}),
      resources: get(this.serverless, 'service.resources', {}),
    };

    const reducer = (mergedLeftObj, rightObj) => {
      const arrayHandler = (paramName, val1, val2) => {
        if (val1 === undefined || val1 === null) {
          return val2;
        }

        if (val2 === undefined || val2 === null) {
          return val1;
        }

        if (!Array.isArray(val1) || !Array.isArray(val2)) {
          return val2;
        }

        return val1.concat(val2);
      };

      return merge(arrayHandler, mergedLeftObj, rightObj);
    };
    const mergedValues = [subset, ...this.files.map(resolve)].reduce(
      reducer,
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
        custom: resolve(filename),
      });
    }
  }
}

module.exports = Modularize;
