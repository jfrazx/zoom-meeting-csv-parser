function assign(object, key, data) {
  return Object.assign(Object.create(null), object, { [key]: data });
}

module.exports = assign;
