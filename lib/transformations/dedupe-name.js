const { deDupe } = require('./helpers');

/**
 *
 *  DEDUPE
 *
 */

function deDupeByName(participants) {
  return deDupe(participants, 'participant');
}

module.exports = deDupeByName;
