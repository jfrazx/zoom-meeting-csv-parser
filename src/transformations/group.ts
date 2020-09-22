import { Participant } from '../interfaces/participant';
/**
 *
 * GROUP FIELDS
 *
 */
const DUNDER = /__/;

export const group = (participants: Participant[]): Participant[] =>
  participants.map((participant) => mergeByPrefix(participant));

const mergeByPrefix = (participant: Participant) => {
  const keys = Object.keys(participant);

  for (const [index, key] of keys.entries()) {
    if (key.match(DUNDER)) {
      keys.splice(index, aggregateByPrefix(participant, keys, index) - index - 1);
    }
  }

  return participant;
};

const aggregateByPrefix = (
  participant: Participant,
  keys: string[],
  index: number,
): number => {
  const prefix = keys[index].split(DUNDER).shift() as string;
  const reg = new RegExp(`^${prefix}__`);
  const accumulate: Participant = {};

  do {
    const key = keys[index].replace(reg, '');

    accumulate[key] = participant[keys[index]];

    delete participant[keys[index++]];
  } while (keys[index].startsWith(prefix));

  participant[prefix] = accumulate;

  return index;
};
