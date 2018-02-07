const { isArray, isObject, traverseObject } = require('./helpers');

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
  for (const [index, value] of values.entries()) {
    if (/^-(\(-\))?$/.test(value) && values.length > 1) {
      values.splice(index, 1);
    }
  }
  return values;
}

function averageValues(values) {
  const notNumbers = extractNonNumber(values);

  return (
    Math.round(
      values
        .filter(value => /\d+/.test(value))
        .map(value => value.match(/\d+(\.\d+)?/g).shift())
        .map(
          value =>
            value.includes('.') ? parseFloat(value) : parseInt(value, 10)
        )
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
