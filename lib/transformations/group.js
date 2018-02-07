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
  const accumulate = [];

  do {
    accumulate.push([
      keys[index]
        .split(DUNDER)
        .slice(1)
        .join('_'),
      participant[keys[index]],
    ]);

    delete participant[keys[index++]];
  } while (keys[index].startsWith(prefix));

  mapToPrefix(participant, accumulate, prefix);

  return index;
}

function mapToPrefix(participant, accumulation, prefix) {
  participant[prefix] = Object.create(null);

  // eslint-disable-next-line no-unused-vars
  for (const [_, values] of accumulation.entries()) {
    const [key, value] = values;
    participant[prefix][key] = value;
  }
}

module.exports = group;
