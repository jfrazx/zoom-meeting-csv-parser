const { assign, isNullish } = require('./helpers');

/**
 *
 * COMPACT
 *
 */
function compact(participants) {
  return participants.map(participant => removeNullValues(participant));
}

function removeNullValues(participant) {
  return Object.keys(participant).reduce(
    (user, key) =>
      isNullish(participant[key]) ? user : assign(user, key, participant[key]),
    Object.create(null)
  );
}

module.exports = compact;
