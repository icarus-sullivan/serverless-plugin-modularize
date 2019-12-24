/* eslint-disable import/no-dynamic-require */
const path = require('path');
const fs = require('fs');
const jsyaml = require('js-yaml');

const resolve = (file) => {
  const { ext } = path.parse(file);
  switch (ext.slice(1)) {
    case 'json': {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    case 'yml':
    case 'yaml': {
      return jsyaml.safeLoad(fs.readFileSync(file, 'utf8'));
    }
    case 'js': {
      return require(file);
    }
    default: {
      throw new Error(`Unsupported filetype ${ext}`);
    }
  }
};

module.exports = {
  resolve,
};
