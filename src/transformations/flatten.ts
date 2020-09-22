import { isArray, traverseObject, isParticipant } from './helpers';
import { Participant } from '../interfaces';

const add = (a: number, b: number) => a + b;
const JUNK = /^-(\(-\))?$/;

/**
 *
 * FLATTEN ARRAY VALUES FROM DUPLICATE PARTICIPANTS
 *
 */

export const flatten = <K extends keyof Participant>(
  field: string,
  values: Participant[K],
  participant: Participant,
): Participant => {
  if (isArray(values)) {
    const cleaned = removeJunk(values);

    if (
      field.includes('min') ||
      (cleaned[0].match(/\d+:\d+\s+[A|P]M/) && field.match(/^join\S+/))
    ) {
      participant[field] = cleaned.sort().find((v) => v) as Participant[K];
    } else if (cleaned.find((v: string) => /\d/.test(v))) {
      participant[field] = averageValues(cleaned);
    } else {
      participant[field] = cleaned.sort().pop() as Participant[K];
    }
  } else if (isParticipant(values)) {
    traverseObject(values, flatten);
  }

  return participant;
};

const removeJunk = (values: string[]): string[] => {
  return values.filter((value) => JUNK.test(value) === false);
};

const averageValues = (values: string[]) => {
  const notNumbers = extractNonNumber(values);

  return (
    Math.round(
      values
        .filter((value) => /\d+/.test(value))
        .map((value) => {
          const matched = value.match(/\d+(\.\d+)?/g)?.shift() as string;

          return matched.includes('.') ? parseFloat(matched) : parseInt(matched, 10);
        })
        .filter((v) => v)
        .reduce(add, 0) / values.length,
    ) + (notNumbers.sort((a, b) => a.length - b.length).pop() as string)
  );
};

const extractNonNumber = (values: string[]): string[] =>
  values.map((value) => value.match(/[^0-9]+/g)?.shift() as string);
