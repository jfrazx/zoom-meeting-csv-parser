const { isObject } = require('./helpers');

function toArray(participants) {
  return participants.map(participant => mapKeys(participant));
}

function mapKeys(participant) {
  return Object.keys(participant).map(key => keyParticipant(key, participant));
}

function keyParticipant(key, participant) {
  return [
    key,
    isObject(participant[key]) ? mapKeys(participant[key]) : participant[key],
  ];
}

module.exports = toArray;
