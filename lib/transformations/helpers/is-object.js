const isArray = require('./is-array');
const isType = require('./is-type');

function isObject(maybeAnObjectButThenAgainMaybeNot) {
  return (
    maybeAnObjectButThenAgainMaybeNot &&
    isType('object', maybeAnObjectButThenAgainMaybeNot) &&
    isArray(maybeAnObjectButThenAgainMaybeNot) === false
  );
}

module.exports = isObject;
