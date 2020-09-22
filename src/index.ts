import { Participant, Transformations, Transforms } from './interfaces';
import * as fs from 'fs';

import {
  assign,
  isString,
  isFunction,
  flattenFilter,
  traverseObject,
  isArrayTransform,
} from './transformations/helpers';

type Host = Participant[];
type Participants = Participant[];

const defaultEncoding = 'utf8';

// @ts-ignore
export function zsv<H = Host, P = Participants>(
  csv: string,
  ...transformations: Transformations
): Promise<[H, P]>;
export function zsv<H = Host, P = Participants>(
  csv: string,
  encoding?: string,
  ...transformations: Transformations
): Promise<[H, P]>;
export function zsv<H = Host, P = Participants>(
  csv: string,
  encoding: any = defaultEncoding,
  ...transformations: Transformations
): Promise<[H, P]> {
  if (!isString(encoding)) {
    transformations.unshift(encoding);
    encoding = defaultEncoding;
  }

  return new Promise<[H, P]>((resolve, reject) => {
    fs.readFile(csv, encoding, (error, contents: string) => {
      if (error) {
        return reject(error);
      }

      resolve(retrieveZoomUserData(contents, reject, flattenTransforms(transformations)));
    });
  });
}

const retrieveZoomUserData = (
  content: string,
  reject: (reason?: any) => void,
  transformations: Transforms[],
) => {
  const [hosts, participants] = partition(content);

  if (!participants.length) {
    return reject(
      new Error('No participants! Are you sure this is a Zoom Meeting CSV?'),
    ) as any;
  }

  return [hosts, participants].map((users) => parseData(users, transformations));
};

const partition = (content: string) => {
  const hostData: string[] = [];
  const participantData: string[] = [];
  let foundParticipants = false;

  for (const line of content.split(/\r\n/g)) {
    if (foundParticipants || (foundParticipants = line.startsWith('Participant'))) {
      participantData.push(line);
    } else {
      hostData.push(line);
    }
  }

  return [hostData, participantData];
};

const flattenTransforms = (transformations: Transformations) =>
  flattenFilter(transformations, isFunction);

const parseData = ([headers, ...data]: string[], transformations: Transforms[]) =>
  processTransformations(
    data
      .filter((participant) => participant)
      .map((participant) => parseParticipants(participant, headers)),
    transformations,
  );

const parseParticipants = (participant: string, headers: string): Participant => {
  const participantInfo = participant
    .split(/(,)(?=(?:[^"]|"[^"]*")*$)/g)
    .filter((value) => value !== ',');

  return parserHeaders(headers).reduce(
    (object, field, index) => assign(object, field, participantInfo[index]),
    Object.create(null),
  );
};

const parserHeaders = (headers: string) =>
  headers
    .split(',')
    .map((header) =>
      header
        .replace(/\)/g, '')
        .replace(/[\s(-:]/g, '_')
        .toLowerCase(),
    )
    .filter((field) => field);

const processTransformations = (
  participants: Participant[],
  transformations: Transforms[],
) => {
  for (const transform of transformations) {
    participants = isArrayTransform(transform)
      ? transform(participants)
      : participants.map(
          (participant) => traverseObject(participant, transform) || participant,
        );
  }

  return participants;
};

export { Participant, Transformations, Transforms } from './interfaces';
export const zoom = zsv;
export {
  camelCase,
  compact,
  deDupeByIP,
  deDupeByName,
  flatten,
  group,
  minutesInMeeting,
  pluck,
  toArray,
} from './transformations';
