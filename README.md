object-path
===========

Access deep properties using a path

[![NPM version](https://badge.fury.io/js/object-path.png)](http://badge.fury.io/js/object-path) [![Build Status](https://travis-ci.org/mariocasciaro/object-path.png)](https://travis-ci.org/mariocasciaro/object-path) [![Coverage Status](https://coveralls.io/repos/mariocasciaro/object-path/badge.png)](https://coveralls.io/r/mariocasciaro/object-path) [![devDependency Status](https://david-dm.org/mariocasciaro/object-path/dev-status.svg)](https://david-dm.org/mariocasciaro/object-path#info=devDependencies) ![Downloads](http://img.shields.io/npm/dm/object-path.svg) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

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
as array unless a new instance is created with `new objectPath.Class({numberAsArray: true})`
* If you were adding methods directly to the global object `objectPath`, it's advised to
use `objectPath.extend(function(op){ })` now
* By default, non-own properties won't be accessable, you must create a new instance
 using `new objectPath.Class({ ownPropertiesOnly: false })` so it can access any type of properties,
 including from Proxy and inherited classes
* The `objectPath` global in the browser is now an instance of the ObjectPath 'class', that
you can now derive in your code, as in:

```js
// in ES5
function MyClass(options) {
  objectPath.Class.call(this, options);
}
MyClass.prototype = Object.create(objectPath.Class.prototype);
```

```es6
// in ES6
import objectPath from 'object-path';

class MyClass extends objectPath.Class {
  constructor(options) {
    super(options);
  }
}
```

* Each method now (`objectPath.get`, `objectPath.set`, etc) has a valid `this` context,
so using `var set = objectPath.set; set(obj, 'path', value)` won't work. You need to either use an
import in ES6 style (`import { del } from 'object-path'`) or bind the function to the object,
like `var set = objectPath.set.bind(objectPath)`)

## Usage

```javascript

var obj = {
  a: {
    b: "d",
    c: ["e", "f"],
    '\u1200': 'unicode key',
    'dot.dot': 'key'
  }
};

var objectPath = require("object-path").instance; // this instance will be the same in any other files you call it
// var objectPath = new require('object-path').Class(); // this objectPath instance will only be available in this file
// import { set, get, del } from 'object-path'; // standalone functions
// var ObjectPath = require('object-path'); // ObjectPath.Class, ObjectPath.instance, ObjectPath.del, etc

//get deep property
objectPath.get(obj, "a.b");  //returns "d"
objectPath.get(obj, ["a", "dot.dot"]);  //returns "key"
objectPath.get(obj, 'a.\u1200');  //returns "unicode key"

//get the first non-undefined value
objectPath.coalesce(obj, ['a.z', 'a.d', ['a','b']], 'default');

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
var model = objectPath({
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

**object-path** can be extended using plugins per instance or per global instance (`objectPath` global).
Those plugins can add new functionality or modify existing ones.

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
`objectPath.tryGet(obj, 'some.path')` after the call to extend. The first `baseFunctions` object passed
to the extend function contains all the original internal functions, that behave exactly the same even
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
objectPath.extend(function(baseFunctions, options) {
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
