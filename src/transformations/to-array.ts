import { Participant } from '../interfaces';
import { isParticipant } from './helpers';

export const toArray = (participants: Participant[]): any[] =>
  participants.map((participant) => mapKeys(participant));

const mapKeys = (participant: Participant): ParticipantArray[] =>
  Object.keys(participant).map((key) => groupParticipantKeyValue(key, participant));

const groupParticipantKeyValue = (
  key: string,
  participant: Participant,
): ParticipantArray => {
  const value = participant[key];

  return [key, isParticipant(value) ? mapKeys(value) : (participant[key] as StrNum)];
};

type StrNum = string | number;
type ParticipantArray = [string, StrNum | (StrNum | ParticipantArray)[]];
