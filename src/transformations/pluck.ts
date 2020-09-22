import { assign, flattenFilter, inObject, isString } from './helpers';
import { Participant } from '../interfaces';
/**
 *
 * PLUCK
 *
 */
export const pluck = (...fields: string[]): Pluck => {
  const flattenedFields = flattenFilter(fields, isString);

  return (participants: Participant[]): Participant[] =>
    participants.map((participant) =>
      pluckObjectFields(participant, flattenedFields),
    );
};

const pluckObjectFields = (
  participant: Participant,
  fields: string[],
): Participant =>
  fields.reduce(
    (user, field) =>
      inObject(field, participant)
        ? assign(user, field, participant[field])
        : user,
    Object.create(null),
  );

type Pluck = (participants: Participant[]) => Participant[];
