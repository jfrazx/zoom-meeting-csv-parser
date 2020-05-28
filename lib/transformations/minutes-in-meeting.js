const { isArray } = require('./helpers');

/**
 *
 * MINUTES IN MEETING
 *
 */

function minutesInMeeting(participants) {
  return participants.map(participant =>
    processParticipantMeetingTime(participant)
  );
}

function processParticipantMeetingTime(participant) {
  const [join, leave, minutes] = determineFieldCasing(participant);
  if (join) {
    participant[minutes] = isArray(participant[join])
      ? processParticipantArrayTime(participant, join, leave)
      : calculateTime(participant[join], participant[leave]);
  }

  return participant;
}

function determineFieldCasing(participant) {
  return participant.join_time ?
    ['join_time', 'leave_time', 'minutes_in_meeting'] :
    participant.joinTime ? ['joinTime', 'leaveTime', 'minutesInMeeting'] : [];
}

function processParticipantArrayTime(participant, join, leave) {
  return participant[join].reduce(
    (memo, time, index) =>
      calculateTime(time, participant[leave][index]) + memo,
    0
  );
}

function calculateTime(join, leave) {
  return Math.abs(parseTime(leave) - parseTime(join));
}

function parseTime(time) {
  const [hours, minutes] = time.match(/[0-9]+/g);
  return (
    hourToMinutes(parseInt(hours, 10), time.includes('PM')) +
    parseInt(minutes, 10)
  );
}
/**
 * @todo fix this
 */
function hourToMinutes(hours, pm) {
  return (pm && hours !== 12 ? hours + 12 : hours) * 60;
}

module.exports = minutesInMeeting;
