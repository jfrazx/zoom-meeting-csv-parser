import { expect } from 'chai';

import {
  zoom,
  compact,
  flatten,
  camelCase,
  deDupeByIP,
  deDupeByName,
  group,
  Participant,
  pluck,
  minutesInMeeting,
  toArray,
} from '../src';

const EXAMPLE = './spec/csv/example.csv';
const WEBINAR = './spec/csv/webinar.csv';

describe('Zoom Meeting CSV Parser', () => {
  it('should return an array of arrays', async () => {
    const data = await zoom(EXAMPLE);
    expect(data).to.be.an('array');
    expect(data[0]).to.be.an('array');
    expect(data[1]).to.be.an('array');
    expect(data).to.have.lengthOf(2);

    data[0].forEach((object) => expect(object).to.be.an('object'));
    data[1].forEach((object) => expect(object).to.be.an('object'));
  });

  it('should catch errors when the file does not exist', async () => {
    await zoom('sample.csv').catch((error) => {
      expect(error.message).to.eq("ENOENT: no such file or directory, open 'sample.csv'");
    });
  });

  it('should reject when passing an invalid csv', async () => {
    await zoom('./spec/csv/invalid.csv').catch((error) => {
      expect(error.message).to.eq(
        'No participants! Are you sure this is a Zoom Meeting CSV?',
      );
    });
  });

  it('should have host objects', async () => {
    const [[host]] = await zoom(EXAMPLE);

    expect(host.host).to.eq('Bart Simpson');
    expect(host.email).to.eq('bart-simpson@example.com');
    expect(host.user_type).to.eq('Pro');
    expect(host.participants).to.eq('15');
    expect(host.duration__hh_mm_ss).to.eq('01:05:51');
  });

  it('should have participant objects', async () => {
    const [, participants] = await zoom(EXAMPLE);
    const archer = findArcher(participants);

    expect(archer.participant).to.eq('archer');
    expect(archer.audio__receiving_bitrate).to.be.a('string');
    expect(archer.video__receiving_jitter).to.be.a('string');
    expect(archer.screen_sharing__receiving_jitter).to.be.a('string');
  });

  it('should accept deDupeByName as a callback, removing duplicate users', async () => {
    const [, participants] = await zoom(EXAMPLE, deDupeByName);

    const archer = findArcher(participants);

    expect(archer.participant).to.eq('archer');
    expect(archer.audio__receiving_bitrate).to.be.an('array');
    expect(archer.video__receiving_jitter).to.be.an('array');
    expect(archer.screen_sharing__receiving_jitter).to.be.an('array');
  });

  it('should accept deDupeByIP as a callback, removing duplicate users', async () => {
    const [, participants] = await zoom(EXAMPLE, deDupeByIP);

    const participant = participants.find((p) => Array.isArray(p.participant));

    expect(participant.participant).to.be.an('array').with.length(2);
    expect(participant.audio__receiving_bitrate).to.be.an('array');
    expect(participant.video__receiving_jitter).to.be.an('array');
    expect(participant.screen_sharing__receiving_jitter).to.be.an('array');
  });

  it('should group similar items into a nested object', async () => {
    const [hosts, participants] = await zoom(EXAMPLE, group);
    const [host] = hosts;
    const archer = findArcher(participants);

    expect(host.duration).to.be.an('object');
    expect((host.duration as Participant).hh_mm_ss).to.eq('01:05:51');

    expect(archer.audio).to.be.an('object');
    expect(archer.audio.receiving_bitrate).to.be.a('string');
    expect(archer.video).to.be.an('object');
    expect(archer.video.receiving_jitter).to.be.a('string');
    expect(archer.screen_sharing).to.be.an('object');
    expect(archer.screen_sharing.receiving_jitter).to.be.a('string');
  });

  it('should camel case all properties', async () => {
    const [, participants] = await zoom(
      EXAMPLE,
      camelCase,
      'this will get ignored' as any,
    );
    const archer = findArcher(participants);

    expect(archer.audioReceivingBitrate).to.be.a('string');
    expect(archer.videoReceivingJitter).to.be.a('string');
    expect(archer.screenSharingReceivingJitter).to.be.a('string');

    for (const field in archer) {
      expect(field).not.to.match(/_[a-z]/g);
    }
  });

  it('should calculate the minutes spent in the meeting', async () => {
    const [, participants] = await zoom(EXAMPLE, minutesInMeeting);

    for (const participant of participants) {
      expect(participant.minutes_in_meeting).to.be.a('number');
    }
  });

  it('should flatten deDuped results', async () => {
    const [, participants] = await zoom(EXAMPLE, [deDupeByName, deDupeByIP, flatten]);

    for (const participant of participants) {
      for (const field in participant) {
        expect(participant[field]).to.not.be.an('array');
      }
    }
  });

  it('should calculate minutes from deDuped results', async () => {
    const [, participants] = await zoom(EXAMPLE, [
      deDupeByName,
      deDupeByIP,
      minutesInMeeting,
      flatten,
    ]);

    for (const participant of participants) {
      expect(participant.minutes_in_meeting).to.be.a('number');
      expect(participant.join_time).to.be.a('string');
      expect(participant.leave_time).to.be.a('string');
    }
  });

  it('should deDupe by name and IP, group, flatten, calculate minutes in meeting and camel case fields', async () => {
    const [, participants] = await zoom(EXAMPLE, [
      group,
      deDupeByName,
      deDupeByIP,
      flatten,
      camelCase,
      minutesInMeeting,
    ]);

    for (const participant of participants) {
      for (const [key] of Object.entries(participant)) {
        expect(key).not.to.match(/_[a-z]/g);
      }

      expect(participant.minutesInMeeting).to.be.a('number');
      expect(participant.audio).to.be.an('object');
      expect(participant.video).to.be.an('object');
      expect(participant.screenSharing).to.be.an('object');
    }
  });

  it('should pluck participant keys', async () => {
    const [, participants] = await zoom(
      EXAMPLE,
      pluck('participant', 'ip_address', 'device', 'network_type', 'location'),
    );

    const participant = participants.pop();

    expect(Object.keys(participant)).to.have.lengthOf(5);
    expect(participant.screen_sharing).to.be.undefined;
    expect(participant.participant).to.be.a('string');
  });

  it('should remove null and undefined fields', async () => {
    const [, participants] = await zoom(WEBINAR, compact);

    participants.length = Math.round(participants.length / 2);

    for (const participant of participants) {
      for (const field in participant) {
        expect(participant[field]).to.not.be.undefined;
        expect(participant[field]).to.not.be.null;
      }
    }
  });

  it('should create arrays of key value pairs', async () => {
    const [, participants] = await zoom<any, string[][][]>(EXAMPLE, group, toArray);

    const participant = participants.pop();
    expect(participant).to.be.an('array');

    for (const pair of participant) {
      expect(pair).to.be.an('array');

      processNested(pair);
    }
  });

  it('should parse webinar csvs', async () => {
    const [, participants] = await zoom(WEBINAR, compact);

    participants.forEach((participant) => {
      const keys = Object.keys(participant);

      expect(keys).to.have.length.gte(14);
    });
  });
});

function processNested(values: string[] | string[][]) {
  for (const value of values) {
    if (Array.isArray(value)) {
      processNested(value);
    } else {
      expect(value).to.be.a('string');
    }
  }
}

function findArcher(participants) {
  return participants.find((participant) => participant.participant === 'archer');
}
