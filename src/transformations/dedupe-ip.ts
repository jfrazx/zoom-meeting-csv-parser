import { deDupe, isNullish } from './helpers';
import { Participant } from '../interfaces';

export const deDupeByIP = (participants: Participant[]): Participant[] => {
  const [participant] = participants;

  return deDupe(
    participants,
    isNullish(participant.ip_address) ? 'ipAddress' : 'ip_address',
  );
};
