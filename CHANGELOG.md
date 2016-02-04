# 1.0.0

## New

* Support for Symbol paths (if present in the current environment)

* Plugginable interface (with noConflict option)

## Fixes

* Expected behavior is more consistent across different scenarios (Principle of least astonishment)

## Tweaks

* isArray now uses native Array.isArray if available

* Helper functions (isArray, isObject, isNumber, etc) that are used a lot, over and over, would impact
performance in tight loops, so they have been optimized for speed.

## Breaking Changes

* `objectPath.push` needs to receive an array as a third parameter instead. It plays better with spread operator
from ES2015+ `objectPath.push(obj, 'path', [1, ...args, 2, ...moreargs])` and no need for
slow(er) `objectPath.push.call` / `objectPath.push.apply`

* Empty paths now throw, you can purposedly disable this by passing `true` to the `noThrow` argument available in all functions.

* `objectPath(obj)` now needs to be called as `objectPath.bind(obj)`

* The functions no longer return the object itself if the path is empty, but will return `undefined`, assuming `noThrow` is true