

object-path
===========

Access deep properties using a path

[![NPM](https://nodei.co/npm/object-path.png?downloads=true)](https://nodei.co/npm/object-path/)

[![Build Status](https://travis-ci.org/mariocasciaro/object-path.png)](https://travis-ci.org/mariocasciaro/object-path)
[![Coverage Status](https://coveralls.io/repos/mariocasciaro/object-path/badge.png)](https://coveralls.io/r/mariocasciaro/object-path)

[![browser support](https://ci.testling.com/mariocasciaro/object-path.png)](https://ci.testling.com/mariocasciaro/object-path)

## Usage

```javascript

var obj = {
  a: {
    b: "d",
    c: ["e", "f"]
  }
};

var objectPath = require("object-path");

//get deep property
objectPath.get(obj, "a.b");  //returns "d"

//works also with arrays
objectPath.get(obj, "a.c.1");  //returns "f"

//set
objectPath.set(obj, "a.h", "m");
objectPath.get(obj, "a.h");  //returns "m"

//set will create intermediate object/arrays
objectPath.set(obj, "a.j.0.f", "m");

//push into arrays (and create intermediate objects/arrays)
objectPath.push(obj, "a.k", "o");

//Ensure a path exists (if it doesn't, set the default value you provide)
objectPath.ensureExists(obj, "a.k.1", "DEFAULT");


```


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/mariocasciaro/object-path/trend.png)](https://bitdeli.com/free "Bitdeli Badge")