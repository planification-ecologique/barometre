# Lessons

## Map iterators in production WebViews

`Map.prototype.keys()`, `.values()`, `.entries()`, and `[...map.keys()]` throw
`TypeError: ….keys is not a function or its return value is not iterable`
in some embedded browsers. `Map#forEach` still works.

Use `mapKeysStable` / `mapValuesStable` / `mapEntriesStable` from `app/src/utils/mapIter.js`.
Do not spread a Map iterator in app code.
