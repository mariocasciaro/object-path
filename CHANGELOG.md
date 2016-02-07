# 1.0.0

## New

* Support for Symbol paths (if present in the current environment)

* Plugginable interface (with noConflict option) through `objectPath.extend`

## Fixes

* Expected behavior is more consistent across different scenarios (Principle of least astonishment)

## Tweaks

* Helper functions (isArray, isObject, isNumber, etc) that are used a lot, over and over, would impact
performance in tight loops, so they have been optimized for speed.

## Breaking Changes

* `objectPath.push` needs to receive an array as a third parameter instead. It plays better with spread operator
from ES2015+ `objectPath.push(obj, 'path', [1, ...args, 2, ...moreargs])` and no need for
slow(er) `objectPath.push.call` / `objectPath.push.apply`

* Empty paths and empty objects now throw, you can purposedly disable this and have the old 0.x behavior by
passing `true` to the `noThrow` argument available in all functions. The thrown error is a custom error based
on `ReferenceError`, so you can effectively filter this exception when using promises and generator functions

* `objectPath(obj)` now needs to be called as `objectPath.bind(obj)`

* The functions no longer return the object itself if the path is empty, but will return `undefined`,
assuming `noThrow` is `true`

* Since `0` paths (as a number) is a valid path to `objectPath`, isEmpty considers 0 to being non-empty (but other falsy values remain)