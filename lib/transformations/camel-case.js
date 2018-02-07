const { isObject } = require('./helpers');

/**
 * CAMELCASE FIELDS
 */

function camelCase(participants) {
  return participants.map(participant => camelize(participant));
}

function camelize(participant) {
  for (let [key, value] of Object.entries(participant)) {
    if (key.match(/_?_[a-z]/)) {
      delete participant[key];

      key = key.replace(/_?_([a-z])/g, (_, char) => char.toUpperCase());
    }

    participant[key] = isObject(value) ? camelize(value) : value;
  }

  return participant;
}

module.exports = camelCase;
