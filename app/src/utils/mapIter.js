/**
 * Map keys/values/entries without Map.prototype.keys/values/entries.
 * Some production WebViews expose Map#forEach but a missing or non-iterable
 * iterator, which throws: "keys is not a function or its return value is not iterable".
 */

export function mapKeysStable(map) {
  const keys = [];
  map.forEach((_value, key) => {
    keys.push(key);
  });
  return keys;
}

export function mapValuesStable(map) {
  const values = [];
  map.forEach((value) => {
    values.push(value);
  });
  return values;
}

export function mapEntriesStable(map) {
  const entries = [];
  map.forEach((value, key) => {
    entries.push([key, value]);
  });
  return entries;
}
