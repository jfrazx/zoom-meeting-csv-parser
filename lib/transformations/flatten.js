const { isArray, isObject, traverseObject } = require('./helpers');
const JUNK = /^-(\(-\))?$/;
/**
 *
 * FLATTEN ARRAY VALUES FROM DUPLICATE PARTICIPANTS
 *
 */

function flatten(field, values, participant) {
  if (isArray(values)) {
    values = removeJunk(values);

    if (
      field.includes('min') ||
      (values[0].match(/\d+:\d+\s+[A|P]M/) && field.match(/^join\S+/))
    ) {
      participant[field] = values.sort().find(v => v);
    } else if (values.find(v => /\d/.test(v))) {
      participant[field] = averageValues(values);
    } else {
      participant[field] = values.sort().pop();
    }
  } else if (isObject(values)) {
    traverseObject(values, flatten);
  }
}

function removeJunk(values) {
  return values.filter(value => JUNK.test(value) === false);
}

function averageValues(values) {
  const notNumbers = extractNonNumber(values);

  return (
    Math.round(
      values
        .filter(value => /\d+/.test(value))
        .map(value => {
          const matched = value.match(/\d+(\.\d+)?/g).shift();
          return matched.includes('.') ? parseFloat(matched) : parseInt(matched, 10);
        })
        .filter(v => v)
        .reduce(add, 0) / values.length
    ) + notNumbers.sort((a, b) => a.length - b.length).pop()
  );
}

function extractNonNumber(values) {
  return values.map(value => value.match(/[^0-9]+/g).shift());
}

function add(a, b) {
  return a + b;
}

module.exports = flatten;
