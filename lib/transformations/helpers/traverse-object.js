function traverseObject(object, transform) {
  for (const [field, value] of Object.entries(object)) {
    transform(field, value, object);
  }
}

module.exports = traverseObject;
