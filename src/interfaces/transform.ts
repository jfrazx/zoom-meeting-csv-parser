import { Participant } from './participant';

export type FieldTransform = (
  field: string,
  value: any,
  object: Participant,
) => Participant;

export type ArrayTransform<T = Participant> = (participants: Participant[]) => T[];
export type Transforms<T = Participant> = ArrayTransform<T> | FieldTransform;
export type Transformations<T = Participant> = Transforms<T>[] | Transforms<T>[][];
