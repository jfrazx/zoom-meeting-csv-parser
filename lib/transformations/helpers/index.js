const traverseObject = require('./traverse-object');
const flattenFilter = require('./flatten-filter');
const isNullish = require('./is-nullish');
const inObject = require('./in-object');
const isObject = require('./is-object');
const isArray = require('./is-array');
const isType = require('./is-type');
const assign = require('./assign');
const deDupe = require('./dedupe');

module.exports = {
  assign,
  deDupe,
  flattenFilter,
  inObject,
  isArray,
  isNullish,
  isObject,
  isType,
  traverseObject,
};
