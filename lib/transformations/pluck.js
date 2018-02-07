const { assign, flattenFilter, inObject, isType } = require('./helpers');
/**
 *
 * PLUCK
 *
 */
function pluck(...fields) {
  fields = flattenFilter(fields, field => isType('string', field));

  return participants =>
    participants.map(participant => pluckObjectFields(participant, fields));
}

function pluckObjectFields(participant, fields) {
  return fields.reduce((user, field) => {
    return inObject(field, participant)
      ? assign(user, field, participant[field])
      : user;
  }, Object.create(null));
}

module.exports = pluck;
