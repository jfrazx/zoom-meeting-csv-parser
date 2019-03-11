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
  const accumulate = [];

  do {
    accumulate.push([keys[index].replace(reg, ''), participant[keys[index]]]);

    delete participant[keys[index++]];
  } while (keys[index].startsWith(prefix));

  participant[prefix] = arrayToObject(accumulate);

  return index;
}

function arrayToObject(accumulation) {
  return accumulation.reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: value,
    };
  }, Object.create(null));
}

module.exports = group;
