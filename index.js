'use strict';

const fs = require('fs');
const DUNDER = /__/;

function zsv(csv, encoding = 'utf8', ...transformations) {
  if (typeof encoding !== 'string') {
    transformations.push(encoding);
    encoding = 'utf8';
  }

  return new Promise((resolve, reject) => {
    fs.readFile(csv, encoding, (error, contents) => {
      if (error) { return reject(error); }

      resolve(
        retrieveZoomUserData(
          contents,
          reject,
          flattenTransforms(transformations)
        )
      );
    });
  });
}

function retrieveZoomUserData(content, reject, transformations) {
  const [hosts, participants] = partition(content);

  if (!participants.length) {
    return reject(
      new Error('No participants! Are you sure this is a Zoom Meeting CSV?')
    );
  }

  return [
    parseData(hosts, transformations),
    parseData(participants, transformations)
  ];
}

function partition(content) {
  const hostData = [];
  const participantData = [];
  let foundParticipants = false;

  for (const line of content.split(/\r\n/g)) {
    if (foundParticipants || (foundParticipants = line.startsWith('Participant'))) {
      participantData.push(line);
    } else {
      hostData.push(line);
    }
  }

  return [hostData, participantData];
}

function flattenTransforms(transformations, results = []) {
  for (const element of transformations) {
    if (Array.isArray(element)) {
      flattenTransforms(element, results);
    } else if (typeof element === 'function') {
      results.push(element);
    }
  }

  return results;
}

function parseData(data, transformations) {
  const headers = data.shift();

  return processTransformations(
    data.filter(participant => participant)
            .map(participant => parseParticipants(participant, headers)),
    transformations
  );
}

function parseParticipants(participant, headers) {
  const participantInfo = participant
                            .split(/(,)(?=(?:[^"]|"[^"]*")*$)/g)
                            .filter(value => value && value !== ',');

  return parserHeaders(headers)
          .reduce((object, field, index) => {
            object[field] = participantInfo[index];
            return object;
          }, Object.create(null));
}

function parserHeaders(headers) {
  return  headers.split(',')
            .map(header =>
              header.trim()
                .replace(/\)/g, '')
                .replace(/\s|\(|-|:/g, '_')
                .toLowerCase()
            ).filter(field => field);
}

function processTransformations(participants, transformations) {
  for (const transform of transformations) {
    if (transform.length === 1) {
      participants = transform(participants);
    } else {
      for (const participant of participants) {
        traverseObjectFields(participant, transform);
      }
    }
  }

  return participants;
}

function traverseObjectFields(object, transform) {
  for (const [field, value] of Object.entries(object)) {
    transform(field, value, object);
  }
}


/**
 *
 * TRANSFORMATIONS
 *
 */

 /**
  *
  * GROUP FIELDS
  *
  */

function group(participants) {
  return participants.map(participant => mergeByPrefix(participant));
}

function mergeByPrefix(participant) {
  const keys = Object.keys(participant);

  for (const [index, key] of keys.entries()) {
    if (key.match(DUNDER)) {
      keys.splice(index, aggregateByPrefix(participant, keys, index) - index - 1);
    }
  }

  return participant;
}

function aggregateByPrefix(participant, keys, index) {
    const prefix = keys[index].split(DUNDER).shift();
    const accumulate = [];

    do {
      accumulate.push(
        [
          keys[index].split(DUNDER).slice(1).join('_'),
          participant[keys[index]]
        ]
      );

      delete participant[keys[index++]];
    } while (keys[index].startsWith(prefix));

    mapToPrefix(participant, accumulate, prefix);

    return index;
}

function mapToPrefix(participant, accumulation, prefix) {
  participant[prefix] = {};

  // eslint-disable-next-line no-unused-vars
  for (const [_, values] of accumulation.entries()) {
    const [key, value] = values;
    participant[prefix][key] = value;
  }
}


/**
 *
 *  DEDUPE
 *
 */

function deDupeByName(participants) {
  return deDupe(participants, 'participant');
}

function deDupeByIP(participants) {
  const participant = participants[0];
  return deDupe(participants, participant.ip_address ? 'ip_address' : 'ipAddress');
}

function deDupe(participants, field) {
  const people = Object.create(null);

  for (const participant of participants) {
    if (!(participant[field] in people)) {
      people[participant[field]] = [];
    }

    people[participant[field]].push(participant);
  }

  return Object.keys(people)
          .map(name => handleDuplicates(people[name]));
}

function handleDuplicates(persons) {
  const person = persons.shift();

  if (persons.length) {
    for (const dupe of persons) {
      mergeParticipants(person, dupe);
    }
  }

  return person;
}

function mergeParticipants(participant, dupe) {
  for (const field in dupe) {
    if (isObject(participant[field])) {
      mergeParticipants(participant[field], dupe[field]);
    } else if (Array.isArray(participant[field])) {
      if (!participant[field].includes(dupe[field])) {
        participant[field].push(dupe[field]);
      }
    } else if (participant[field] !== dupe[field]) {
      participant[field] = [participant[field], dupe[field]];
    }
  }
}


/**
 *
 * MINUTES IN MEETING
 *
 */

 function minutesInMeeting(participants) {
  return participants.map(participant => processParticipantMeetingTime(participant));
 }

function processParticipantMeetingTime(participant) {
  const [join, leave, minutes] = determineFieldCasing(participant);
  if (join) {
    participant[minutes] = Array.isArray(participant[join]) ?
      processParticipantArrayTime(participant, join, leave) :
      calculateTime(participant[join], participant[leave]);
  }

  return participant;
}

function determineFieldCasing(participant) {
  if (participant.join_time) {
    return ['join_time', 'leave_time', 'minutes_in_meeting'];
  } else if (participant.joinTime) {
    return ['joinTime', 'leaveTime', 'minutesInMeeting'];
  }
  return [];
}

function processParticipantArrayTime(participant, join, leave) {
  return participant[join]
      .reduce((memo, time, index) =>
        calculateTime(time, participant[leave][index]) + memo,
      0);
}

function calculateTime(join, leave) {
  return Math.abs(parseTime(leave) - parseTime(join));
}

function parseTime(time) {
  const [hours, minutes] = time.match(/[0-9]+/g);
  return hourToMinutes(parseInt(hours, 10), time.includes('PM')) + parseInt(minutes, 10);
}
/**
 * @todo fix this
 */
function hourToMinutes(hours, pm) {
  return (pm ? hours + 12 : hours) * 60;
}

/**
 *
 * FLATTEN ARRAY VALUES FROM DUPLICATE PARTICIPANTS
 *
 */

function flatten(field, values, participant) {
  if (Array.isArray(values)) {
    values = removeJunk(values);

    if (field.includes('min') ||
          (
            values[0].match(/\d+:\d+\s+[A|P]M/) &&
            field.match(/^join\S+/)
          )
    ) {

      participant[field] = values.sort().shift();
    } else if (values.find(v => /\d/.test(v))) {
      participant[field] = averageValues(values);
    } else {
      participant[field] = values.sort().pop();
    }
  } else if (isObject(values)) {
    traverseObjectFields(values, flatten);
  }
}

function removeJunk(values) {
  for (const [index, value] of values.entries()) {
    if ((/^-(\(-\))?$/.test(value)) && values.length > 1) {
      values.splice(index, 1);
    }
  }
  return values;
}

function averageValues(values) {
  const notNumbers = values.map(value => value.match(/[^0-9]+/g).shift());

  return Math.round(
    values.filter(value => /\d+/.test(value))
      .map(value => value.match(/\d+(\.\d+)?/g).shift())
      .map(value =>
        value.includes('.') ?
          parseFloat(value) :
          parseInt(value, 10)
      )
      .filter(v => v)
      .reduce((memo, value) => memo + value, 0)
      / values.length
    )
    + notNumbers.sort((a, b) => a.length - b.length).pop();
}

/**
 * CAMELCASE FIELDS
 */

function camelCaseFields(participants) {
  return participants.map(participant => camelize(participant));
}

function camelize(participant) {
  for (let [key, value] of Object.entries(participant)) {
    if (key.match(/_?_[a-z]/)) {
      delete participant[key];

      key = key.replace(/_?_([a-z])/g, (_, char) => char.toUpperCase());
    }

    participant[key] = isObject(value) ? camelize(value) : value;
  }

  return participant;
}

function isObject(maybeAnObjectButThenAgainMaybeNot) {
  return maybeAnObjectButThenAgainMaybeNot &&
          typeof maybeAnObjectButThenAgainMaybeNot === 'object' &&
          Array.isArray(maybeAnObjectButThenAgainMaybeNot) === false;
}

module.exports.zsv  = zsv;
/**
 * TRANSFORMATIONS
 */
module.exports.minutesInMeeting = minutesInMeeting;
module.exports.camelCaseFields = camelCaseFields;
module.exports.deDupeByName = deDupeByName;
module.exports.deDupeByIP = deDupeByIP;
module.exports.flatten = flatten;
module.exports.group = group;
