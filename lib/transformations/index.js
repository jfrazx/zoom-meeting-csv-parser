const minutesInMeeting = require('./minutes-in-meeting');
const deDupeByName = require('./dedupe-name');
const camelCase = require('./camel-case');
const deDupeByIP = require('./dedupe-ip');
const toArray = require('./to-array');
const compact = require('./compact');
const flatten = require('./flatten');
const group = require('./group');
const pluck = require('./pluck');

module.exports = {
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
