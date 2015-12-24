object-path
===========

Access deep properties using a path

[![NPM version](https://badge.fury.io/js/object-path.png)](http://badge.fury.io/js/object-path) [![Build Status](https://travis-ci.org/mariocasciaro/object-path.png)](https://travis-ci.org/mariocasciaro/object-path) [![Coverage Status](https://coveralls.io/repos/mariocasciaro/object-path/badge.png)](https://coveralls.io/r/mariocasciaro/object-path) [![devDependency Status](https://david-dm.org/mariocasciaro/object-path/dev-status.svg)](https://david-dm.org/mariocasciaro/object-path#info=devDependencies) ![Downloads](http://img.shields.io/npm/dm/object-path.svg)

## Install

### Node.js

```
npm install object-path --save
```

### Browser

```
bower install object-path --save
```

## Breaking changes

#### Upgrading to 1.x from 0.x

* `objectPath(obj)` now needs to be called as `objectPath.bind(obj)`

* Non-existing array paths (denoted by numbers in path, such as 'a.0.b') will be created
as array unless a new instance is created with `new objectPath.Class({ numberAsArray: false })`

* If you were adding methods directly to the global object `objectPath`, it's advised to
use `objectPath.instance.extend(function(base, options){ })` now

* By default, non-own properties won't be accessible, you must create a new instance
 using `new objectPath.Class({ ownPropertiesOnly: false })` so it can access any type of properties,
 including from Proxy and inherited classes, or change the instance option by using `objectPath.instance.option({ ownPropertiesOnly: false })`

* The `objectPath` global in the **browser** is now an instance of the ObjectPath 'class', that
you can now derive in your code, as in:

```js
// in ES5
function MyClass(options) {
  ObjectPathModule.Class.call(this, options);
}
MyClass.prototype = Object.create(ObjectPathModule.Class.prototype);
```

```es6
// in ES6
class MyClass extends ObjectPathModule.Class {
  constructor(options) {
    super(options);
  }
}
```

* The functions `get`, `set`, `del`, `push`, etc that you get from `var objectPath = require('object-path')`
behave more or like the same the version 0.x. If you want the class instance, use `var objectPath = require('object-path').instance;`.
The same instance will be available in all your files, including any plugins you use to extend it.

## Polyfills

Depending on the target engines you are using objectPath on, you'll need a
polyfill for `Array.reduce`

## Usage

```javascript


var symbol = Symbol();
var obj = {
  a: {
    b: "d",
    c: ["e", "f"],
    '\u1200': 'unicode key',
    'dot.dot': 'key',
    [symbol]: 'somekey'
  }
};

// this instance will be the same in any other files you require it, it's the preferable way of using objectPath
var objectPath = require("object-path").instance;

// this objectPath instance will only be available in this file context
// var objectPath = new require('object-path').Class();

// you still have access to old functions get, set, del, push, etc, as their are standalone functions
// var objectPath = require('object-path');

//get deep property
objectPath.get(obj, "a.b");  //returns "d"
objectPath.get(obj, ["a", "dot.dot"]);  //returns "key"
objectPath.get(obj, 'a.\u1200');  //returns "unicode key"
objectPath.get(obj, symbol);  //returns "somekey"

//get the first non-undefined value
objectPath.coalesce(obj, ['a.z', 'a.d', ['a','b'], symbol], 'default');

//empty a given path (but do not delete it) depending on their type,so it retains reference to objects and arrays.
//functions that are not inherited from prototype are set to null.
//object instances are considered objects and just own property names are deleted
objectPath.empty(obj, 'a.b'); // obj.a.b is now ''
objectPath.empty(obj, 'a.c'); // obj.a.c is now []
objectPath.empty(obj, 'a'); // obj.a is now {}

//works also with arrays
objectPath.get(obj, "a.c.1");  //returns "f"
objectPath.get(obj, ["a","c","1"]);  //returns "f"

//can return a default value with get
objectPath.get(obj, ["a.c.b"], "DEFAULT");  //returns "DEFAULT", since a.c.b path doesn't exists, if omitted, returns undefined

//set
objectPath.set(obj, "a.h", "m"); // or objectPath.set(obj, ["a","h"], "m");
objectPath.get(obj, "a.h");  //returns "m"

//set will create intermediate object/arrays
objectPath.set(obj, "a.j.0.f", "m");

//will insert values in array
objectPath.insert(obj, "a.c", "m", 1); // obj.a.c = ["e", "m", "f"]

//push into arrays (and create intermediate objects/arrays)
objectPath.push(obj, "a.k", "o");

//ensure a path exists (if it doesn't, set the default value you provide)
objectPath.ensureExists(obj, "a.k.1", "DEFAULT");
var oldVal = objectPath.ensureExists(obj, "a.b", "DEFAULT"); // oldval === "d"

//deletes a path
objectPath.del(obj, "a.b"); // obj.a.b is now undefined
objectPath.del(obj, ["a","c",0]); // obj.a.c is now ['f']

//tests path existence
objectPath.has(obj, "a.b"); // true
objectPath.has(obj, ["a","d"]); // false

//bind object
var model = objectPath.bind({
  a: {
    b: "d",
    c: ["e", "f"]
  }
});

//now any method from above is supported directly w/o passing an object
model.get("a.b");  //returns "d"
model.get(["a.c.b"], "DEFAULT");  //returns "DEFAULT"
model.del("a.b"); // obj.a.b is now undefined
model.has("a.b"); // false

```

## Extending with plugins

**object-path** can be extended using plugins per instance or per global instance (`var objectPath = require('objectPath').instance`
in Node, and `objectPath` global in browser).
Those plugins can add new functionality or modify existing methods.

To extend `objectPath`, you should use:

```js
objectPath.extend(function(baseFunctions, instanceOptions){
  return {
    tryGet: function(obj, path) {
      if (!baseFunctions.has(obj, path)) {
        throw new Error('path doesn\'t exists')
      }
      return baseFunctions.get(obj, path)
    }
  }
});
```

The returned object will be merged on the current instance. From the example, you'll be able to call
`objectPath.tryGet(obj, 'some.path')` after the call to extend. The first `baseFunctions` parameter
contains all the original internal functions, that behave exactly the same even
if you overwrite the `get`, `set`, `push`, etc methods.

```js
objectPath.extend(function(baseFunctions, instanceOptions){
  return {
    get: function(obj, path, default, cb) {
      // do something
      cb(baseFunctions.get(obj, path, default));
    }
  }
});
```

In this example, `objectPath.get(obj, 'some.path', 'defaultValue', function(value){ })` now uses a
callback instead of returning the value.

When releasing an **object-path** plugin, make sure to add `'object-path'` to
the `keywords` field either in `package.json` or `bower.json`, name your plugin `object-path-PLUGINNAME`, then
make a PR to be included in this list.

<!--
* [object-path-as-promised]()

Adds `objectPath.then`, a getter that returns a promise, and can deal with plain values and promises (thenables)

* [object-path-concat]()

Adds `objectPath.concat`, concat if the path is an array

* [object-path-tryget]()

Adds `objectPath.tryget`, throws if the path doesn't exist

* [object-path-wildcard-set]()

Adds `objectPath.wildcardSet`, can set paths like `some.*.path`

* [object-path-immutable]()

Overrides all `objectPath` functions, make it so object-path don't modify the passed objects, but always create a new object or array
-->

Use them as:

* In Node: `objectPath.extend(require('object-path-pluginname'))`
* In the browser: `<script src="object-path-pluginname/index.js"></script>`
* In ES2015+: `import objectPathPlugin from 'object-path-pluginname'` then `objectPath.extend(objectPathPlugin)`

Your plugin should be defined as:

```js
// in node
module.exports = function(baseFunctions, options) {
  return {
    yourFunction: function() {
    }
  }
}
```

```js
// in browser
ObjectPathModule.instance.extend(function(baseFunctions, options) {
  return {
    yourFunction: function() {
    }
  }
})
```

```es6
// in ES2015+
exports default function(baseFunctions, options) {
  return {
    yourFunction: function() {

    }
  }
}
```

## Credits

* [Mario Casciaro](https://github.com/mariocasciaro) - Author
* [Paulo Cesar](https://github.com/pocesar) - Major contributor
