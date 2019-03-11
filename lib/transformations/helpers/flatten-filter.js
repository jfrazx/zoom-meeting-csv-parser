const { isArray } = require('./helpers');

function flattenFilter(array, cb, results = []) {
  for (const element of array) {
    if (isArray(element)) {
      flattenFilter(element, cb, results);
    } else if (cb(element)) {
      results.push(element);
    }
  }

  return results;
}

module.exports = flattenFilter;
