function assign(object, key, data) {
  return Object.assign(Object.create(null), object, { [key]: data });
}

function inObject(field, object) {
  return field in object;
}

function isArray(value) {
  return Array.isArray(value);
}

function isNullish(value) {
  return value === null || value === undefined;
}

function isString(value) {
  return isType('string', value);
}

function isObject(maybeAnObjectButThenAgainMaybeNot) {
  return (
    maybeAnObjectButThenAgainMaybeNot &&
    isType('object', maybeAnObjectButThenAgainMaybeNot) &&
    isArray(maybeAnObjectButThenAgainMaybeNot) === false
  );
}

function isType(type, compare) {
  return typeof compare === type;
}

module.exports = {
  assign,
  isArray,
  inObject,
  isNullish,
  isObject,
  isString,
  isType,
};
