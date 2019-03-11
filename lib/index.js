'use strict';

const fs = require('fs');

const {
  camelCase,
  compact,
  deDupeByIP,
  deDupeByName,
  flatten,
  group,
  minutesInMeeting,
  pluck,
  toArray,
} = require('./transformations');

const {
  assign,
  flattenFilter,
  isType,
  traverseObject,
} = require('./transformations/helpers');

function zsv(csv, encoding = 'utf8', ...transformations) {
  if (!isType('string', encoding)) {
    transformations.unshift(encoding);
    encoding = 'utf8';
  }

  return new Promise((resolve, reject) => {
    fs.readFile(csv, encoding, (error, contents) => {
      if (error) {
        return reject(error);
      }

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

  return [hosts, participants].map(users => parseData(users, transformations));
}

function partition(content) {
  const hostData = [];
  const participantData = [];
  let foundParticipants = false;

  for (const line of content.split(/\r\n/g)) {
    if (
      foundParticipants ||
      (foundParticipants = line.startsWith('Participant'))
    ) {
      participantData.push(line);
    } else {
      hostData.push(line);
    }
  }

  return [hostData, participantData];
}

function flattenTransforms(transformations) {
  return flattenFilter(transformations, element => isType('function', element));
}

function parseData(data, transformations) {
  const headers = data.shift();

  return processTransformations(
    data
      .filter(participant => participant)
      .map(participant => parseParticipants(participant, headers)),
    transformations
  );
}

function parseParticipants(participant, headers) {
  const participantInfo = participant
    .split(/(,)(?=(?:[^"]|"[^"]*")*$)/g)
    .filter(value => value !== ',');

  return parserHeaders(headers).reduce(
    (object, field, index) => assign(object, field, participantInfo[index]),
    Object.create(null)
  );
}

function parserHeaders(headers) {
  return headers
    .split(',')
    .map(header =>
      header
        .replace(/\)/g, '')
        .replace(/[\s\(-:]/g, '_')
        .toLowerCase()
    )
    .filter(field => field);
}

function processTransformations(participants, transformations) {
  for (const transform of transformations) {
    if (transform.length === 1) {
      participants = transform(participants);
    } else {
      for (const participant of participants) {
        traverseObject(participant, transform);
      }
    }
  }

  return participants;
}

module.exports = {
  zsv,
  zoom: zsv,

  // transformations
  camelCase,
  compact,
  deDupeByIP,
  deDupeByName,
  flatten,
  group,
  minutesInMeeting,
  pluck,
  toArray,
};
