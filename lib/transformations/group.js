/**
 *
 * GROUP FIELDS
 *
 */
const DUNDER = /__/;

function group(participants) {
  return participants.map(participant => mergeByPrefix(participant));
}

function mergeByPrefix(participant) {
  const keys = Object.keys(participant);

  for (const [index, key] of keys.entries()) {
    if (key.match(DUNDER)) {
      keys.splice(
        index,
        aggregateByPrefix(participant, keys, index) - index - 1
      );
    }
  }

  return participant;
}

function aggregateByPrefix(participant, keys, index) {
  const prefix = keys[index].split(DUNDER).shift();
  const reg = new RegExp(`^${prefix}__`);
  const accumulate = {};

  do {
    const key = keys[index].replace(reg, '');

    accumulate[key] = participant[keys[index]];

    delete participant[keys[index++]];
  } while (keys[index].startsWith(prefix));

  participant[prefix] = accumulate;

  return index;
}

module.exports = group;
