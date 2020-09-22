import { Participant } from '../interfaces';
import { deDupe } from './helpers';

/**
 *
 *  DEDUPE
 *
 */

export const deDupeByName = (participants: Participant[]): Participant[] =>
  deDupe(participants, 'participant');
