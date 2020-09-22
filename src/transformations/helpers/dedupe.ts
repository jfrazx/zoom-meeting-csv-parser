import { isArray, isParticipant } from './helpers';
import { wrapDefaults } from '@status/defaults';
import { Participant } from '../../interfaces';

type People = { [key: string]: Participant[] };

export const deDupe = (participants: Participant[], field: string): Participant[] => {
  const people = wrapDefaults<People, Participant[]>({
    defaultValue: [],
    setUndefined: true,
  });

  for (const participant of participants) {
    const key = participant[field] as string;

    people[key].push(participant);
  }

  return Object.keys(people.unwrapDefaults()).map((name) =>
    handleDuplicates(people[name]),
  );
};

const handleDuplicates = (persons: Participant[]): Participant => {
  const [person, ...duplicates] = persons;

  for (const dupe of duplicates) {
    mergeParticipants(person, dupe);
  }

  return person;
};

const mergeParticipants = (participant: Participant, dupe: Participant) => {
  for (const field in dupe) {
    const currentValue = participant[field];

    if (isParticipant(currentValue)) {
      mergeParticipants(currentValue, dupe[field] as Participant);
    } else if (isArray(currentValue)) {
      if (!currentValue.includes(dupe[field] as string)) {
        currentValue.push(dupe[field] as string);
      }
    } else if (currentValue !== dupe[field]) {
      participant[field] = [currentValue, dupe[field] as string];
    }
  }
};
