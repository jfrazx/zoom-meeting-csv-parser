import { FieldTransform, Participant } from '../../interfaces';

export const traverseObject = (
  participant: Participant,
  transform: FieldTransform,
): Participant => {
  for (const [field, value] of Object.entries(participant)) {
    participant = transform(field, value, participant) || participant;
  }

  return participant;
};
