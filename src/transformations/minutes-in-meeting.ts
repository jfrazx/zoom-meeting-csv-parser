import { Participant } from '../interfaces';
import { isArray } from './helpers';

/**
 *
 * MINUTES IN MEETING
 *
 */

export const minutesInMeeting = (participants: Participant[]): Participant[] => {
  return participants.map((participant) => processParticipantMeetingTime(participant));
};

const processParticipantMeetingTime = (participant: Participant) => {
  const [join, leave, minutes] = determineFieldCasing(participant);
  if (join) {
    participant[minutes] = isArray(participant[join])
      ? processParticipantArrayTime(participant, join, leave)
      : (calculateTime(participant[join] as string, participant[leave] as string) as any);
  }

  return participant;
};

const determineFieldCasing = (participant: Participant) => {
  return participant.join_time
    ? ['join_time', 'leave_time', 'minutes_in_meeting']
    : participant.joinTime
    ? ['joinTime', 'leaveTime', 'minutesInMeeting']
    : [];
};

const processParticipantArrayTime = (
  participant: Participant,
  join: string,
  leave: string,
) => {
  return (participant[join] as string[]).reduce(
    (memo, time, index) =>
      calculateTime(time, (participant[leave] as string[])[index]) + memo,
    0,
  );
};

const calculateTime = (join: string, leave: string) => {
  return Math.abs(parseTime(leave) - parseTime(join));
};

const parseTime = (time: string) => {
  const [hours, minutes] = time.match(/[0-9]+/g) as string[];
  return hourToMinutes(parseInt(hours, 10), time.includes('PM')) + parseInt(minutes, 10);
};
/**
 * @todo fix this
 */
const hourToMinutes = (hours: number, pm: boolean) => {
  return (pm && hours !== 12 ? hours + 12 : hours) * 60;
};
