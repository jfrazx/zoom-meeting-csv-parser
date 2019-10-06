const { isObject } = require('./helpers');

/**
 * CAMELCASE FIELDS
 */

function camelCase(participants) {
  return participants.map(participant => camelize(participant));
}

function camelize(participant) {
  for (const [key, value] of Object.entries(participant)) {
    const didMatch = key.match(/_?_[a-z]/);
    const newKey = didMatch ?
      key.replace(/_?_([a-z])/g, (_, char) => char.toUpperCase())
      : key;
    delete participant[key];

    participant[newKey] = isObject(value) ? camelize(value) : value;
  }

  return participant;
}

module.exports = camelCase;
