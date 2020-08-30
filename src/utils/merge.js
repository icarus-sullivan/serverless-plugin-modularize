const { mergeDeepWithKey } = require('ramda');

const mergeArrays = (paramName, val1, val2) => {
  if (Array.isArray(val1) && Array.isArray(val2)) {
    return [...val1, ...val2];
  }

  if (typeof val1 === 'object' && typeof val2 === 'object') {
    return Object.assign(val1, val2);
  }

  return val2 || val1;
};

module.exports = (mergedLeftObj, rightObj) =>
  mergeDeepWithKey(mergeArrays, mergedLeftObj, rightObj);
