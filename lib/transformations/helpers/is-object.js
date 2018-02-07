const isType = require('./is-type');

function isObject(maybeAnObjectButThenAgainMaybeNot) {
  return (
    maybeAnObjectButThenAgainMaybeNot &&
    isType('object', maybeAnObjectButThenAgainMaybeNot) &&
    Array.isArray(maybeAnObjectButThenAgainMaybeNot) === false
  );
}

module.exports = isObject;
