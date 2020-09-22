import { Participant } from '../interfaces';
import { isParticipant } from './helpers';
/**
 * CAMELCASE FIELDS
 */

export const camelCase = (participants: Participant[]): Participant[] =>
  participants.map((participant) => camelize(participant));

const camelize = (participant: Participant): Participant => {
  for (const [key, value] of Object.entries(participant)) {
    const didMatch = key.match(/_?_[a-z]/);
    const newKey = didMatch
      ? key.replace(/_?_([a-z])/g, (_, char) => char.toUpperCase())
      : key;
    delete participant[key];

    participant[newKey] = isParticipant(value) ? camelize(value) : value;
  }

  return participant;
};
