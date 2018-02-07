const { deDupe } = require('./helpers');

function deDupeByIP(participants) {
  const participant = participants[0];
  return deDupe(
    participants,
    participant.ip_address ? 'ip_address' : 'ipAddress'
  );
}

module.exports = deDupeByIP;
