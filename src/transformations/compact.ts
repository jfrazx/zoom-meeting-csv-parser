import { assign, isNullish } from './helpers';
import { Participant } from '../interfaces';

/**
 *
 * COMPACT
 *
 */
export const compact = (participants: Participant[]): Participant[] =>
  participants.map((participant) => removeNullValues(participant));

const removeNullValues = (participant: Participant): Participant =>
  Object.keys(participant).reduce(
    (user, key) =>
      isNullish(participant[key]) ? user : assign(user, key, participant[key]),
    Object.create(null),
  );
