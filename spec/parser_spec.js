/* eslint max-len: 0 */

const { zsv: zoom, flatten, camelCaseFields, deDupeByIP, deDupeByName, group, minutesInMeeting } = require('../index');
const chai = require('chai');
const { expect } = chai;
const EXAMPLE = './spec/csv/example.csv';

describe('Zoom Meeting CSV Parser', () => {

  it('should return an array of arrays', done => {
    zoom(EXAMPLE)
      .then(data => {
        expect(data).to.be.an('array');
        expect(data[0]).to.be.an('array');
        expect(data[1]).to.be.an('array');

        data[0].forEach(object => expect(object).to.be.an('object'));
        data[1].forEach(object => expect(object).to.be.an('object'));

        done();
      })
      .catch(done);
  });

  it('should catch errors when the file does not exist', done => {
    zoom('sample.csv')
      .catch(error => {
        expect(error.message).to.eq('ENOENT: no such file or directory, open \'sample.csv\'');
        done();
      });
  });

  it('should reject when passing an invalid csv', done => {
    zoom('./spec/csv/invalid.csv')
      .catch(error => {
        expect(error.message).to.eq('No participants! Are you sure this is a Zoom Meeting CSV?');
        done();
      });
  });

  it('should have host objects', done => {
     zoom(EXAMPLE)
      .then(data => {
        const [hosts] = data;
        const [host] = hosts;

        expect(host.host).to.eq('Bart Simpson');
        expect(host.email).to.eq('bart-simpson@example.com');
        expect(host.user_type).to.eq('Pro');
        expect(host.participants).to.eq('15');
        expect(host.duration__hh_mm_ss).to.eq('01:05:51');

        done();
      })
      .catch(done);
  });

  it('should have participant objects', done => {
    zoom(EXAMPLE)
      .then(data => {
        // eslint-disable-next-line no-unused-vars
        const [_, participants] = data;
        const archer = findArcher(participants);

        expect(archer.participant).to.eq('archer');
        expect(archer.audio__receiving_bitrate).to.be.a('string');
        expect(archer.video__receiving_jitter).to.be.a('string');
        expect(archer.screen_sharing__receiving_jitter).to.be.a('string');

        done();
      })
      .catch(done);
  });

  it('should accept deDupeByName as a callback, removing duplicate users', done => {
    zoom(EXAMPLE, deDupeByName)
      .then(data => {
        // eslint-disable-next-line no-unused-vars
        const [_, participants] = data;

        const archer = findArcher(participants);

        expect(archer.participant).to.eq('archer');
        expect(archer.audio__receiving_bitrate).to.be.an('array');
        expect(archer.video__receiving_jitter).to.be.an('array');
        expect(archer.screen_sharing__receiving_jitter).to.be.an('array');
        done();
      })
      .catch(done);
  });

  it('should accept deDupeByIP as a callback, removing duplicate users', done => {
    zoom(EXAMPLE, deDupeByIP)
      .then(data => {
        // eslint-disable-next-line no-unused-vars
        const [_, participants] = data;

        const participant = participants.find(p => Array.isArray(p.participant));


        expect(participant.participant).to.be.an('array').with.length(2);
        expect(participant.audio__receiving_bitrate).to.be.an('array');
        expect(participant.video__receiving_jitter).to.be.an('array');
        expect(participant.screen_sharing__receiving_jitter).to.be.an('array');
        done();
      })
      .catch(done);
  });

  it('should group similar items into a nested object', done => {
    zoom(EXAMPLE, group)
      .then(data => {
        const [hosts, participants] = data;
        const [host] = hosts;
        const archer = findArcher(participants);

        expect(host.duration).to.be.an('object');
        expect(host.duration.hh_mm_ss).to.eq('01:05:51');


        expect(archer.audio).to.be.an('object');
        expect(archer.audio.receiving_bitrate).to.be.a('string');
        expect(archer.video).to.be.an('object');
        expect(archer.video.receiving_jitter).to.be.a('string');
        expect(archer.screen_sharing).to.be.an('object');
        expect(archer.screen_sharing.receiving_jitter).to.be.a('string');

        done();
      })
      .catch(done);
  });

    it('should camel case all properties', done => {
      zoom(EXAMPLE, camelCaseFields, 'this will get ignored')
        .then(data => {
          // eslint-disable-next-line no-unused-vars
          const [_, participants] = data;
          const archer = findArcher(participants);

          expect(archer.audioReceivingBitrate).to.be.a('string');
          expect(archer.videoReceivingJitter).to.be.a('string');
          expect(archer.screenSharingReceivingJitter).to.be.a('string');

          for (const field in archer) {
            expect(field).not.to.match(/_[a-z]/g);
          }

          done();
        })
        .catch(done);
  });

  it('should calculate the minutes spent in the meeting', done => {
    zoom(EXAMPLE, minutesInMeeting)
      .then(data => {
        // eslint-disable-next-line no-unused-vars
        const [_, participants] = data;

        for (const participant of participants) {
          expect(participant.minutes_in_meeting).to.be.a('number');
        }

        done();
      })
      .catch(done);
  });

  it('should flatten deDuped results', done => {
    zoom(EXAMPLE, [deDupeByName, deDupeByIP, flatten])
      .then(data => {
        // eslint-disable-next-line no-unused-vars
        const [_, participants] = data;

        for (const participant of participants) {
          for (const field in participant) {
            expect(participant[field]).to.not.be.an('array');
          }
        }

        done();
      })
      .catch(done);
  });

    it('should calculate minutes from deDuped results', done => {
    zoom(EXAMPLE, [deDupeByName, deDupeByIP, minutesInMeeting, flatten])
      .then(data => {
        // eslint-disable-next-line no-unused-vars
        const [_, participants] = data;

        for (const participant of participants) {
          expect(participant.minutes_in_meeting).to.be.a('number');
          expect(participant.join_time).to.be.a('string');
          expect(participant.leave_time).to.be.a('string');
        }

        done();
      })
      .catch(done);
  });

  it('should deDupe by name and IP, group, flatten, calculate minutes in meeting and camel case fields', done => {
    zoom(EXAMPLE, [deDupeByName, deDupeByIP, flatten, camelCaseFields, minutesInMeeting], group)
      .then(data => {
        // eslint-disable-next-line no-unused-vars
        const [_, participants] = data;

        for (const participant of participants) {
          // eslint-disable-next-line no-unused-vars
          for (const [key, _] of Object.entries(participant)) {
            expect(key).not.to.match(/_[a-z]/g);
          }

          expect(participant.minutesInMeeting).to.be.a('number');
          expect(participant.audio).to.be.an('object');
          expect(participant.video).to.be.an('object');
          expect(participant.screenSharing).to.be.an('object');
        }

        done();
      })
      .catch(done);
  });
});

function findArcher(participants) {
  return participants.find(participant =>
    participant.participant === 'archer'
  );
}
