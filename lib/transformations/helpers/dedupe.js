const { wrapDefaults } = require('@status/defaults');
const { isArray, isObject } = require('./helpers');

function deDupe(participants, field) {
  const people = wrapDefaults({ defaultValue: [], setUndefined: true });

  for (const participant of participants) {
    people[participant[field]].push(participant);
  }

  return Object.keys(people.unwrapDefaults()).map(name => handleDuplicates(people[name]));
}

function handleDuplicates(persons) {
  const person = persons.shift();

  if (persons.length) {
    for (const dupe of persons) {
      mergeParticipants(person, dupe);
    }
  }

  return person;
}

function mergeParticipants(participant, dupe) {
  for (const field in dupe) {
    if (isObject(participant[field])) {
      mergeParticipants(participant[field], dupe[field]);
    } else if (isArray(participant[field])) {
      if (!participant[field].includes(dupe[field])) {
        participant[field].push(dupe[field]);
      }
    } else if (participant[field] !== dupe[field]) {
      participant[field] = [participant[field], dupe[field]];
    }
  }
}

module.exports = deDupe;
