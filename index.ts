/*
(function (factory) {
  /* globals define * /
  if (typeof module === 'object' && typeof module.exports === 'object') {
    factory(require, module.exports)
  } else if (typeof define === 'function' && define.amd) {
    define(['require', 'exports'], factory)
  } else {
    var x = {}
    factory(require, x)
    window.ObjectPathModule = x
    window.objectPath = window.ObjectPathModule.instance
  }
}
*/
'use strict';

var _hasOwnProperty = Object.prototype.hasOwnProperty
var _hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator !== 'undefined'

class ObjectPathError implements ReferenceError {
  name = 'ObjectPathError';

  constructor(public message: string) {
    ReferenceError.call(this, message);
  }

}

ObjectPathError.prototype = Object.create(ReferenceError.prototype, {
  constructor: {
    value: ObjectPathError
  }
});

function isNumber(value: any): value is number {
  return typeof value === 'number' && value.constructor === Number;
}

function isString(obj: any): obj is string {
  return typeof obj === 'string' && obj.constructor === String;
}

function isObject(obj: any): obj is Object {
  return typeof obj === 'object' && obj !== null && obj.constructor !== Array;
}

function isSymbol(obj: any): obj is symbol {
  return _hasSymbols && typeof obj === 'symbol' && obj.constructor === Symbol;
}

function isArray(obj: any): obj is any[] {
  return Array.isArray ? Array.isArray(obj) : typeof obj === 'object' && obj !== null && obj.constructor === Array;
}

function isBoolean(obj: any): obj is boolean {
  return typeof obj === 'boolean' && obj.constructor === Boolean;
}

function merge<T extends any, U>(base: T, ...args: any[]): T & U {
  if (!isObject(base)) {
    base = <T>{};
  }

  for (var arg of args) {
    if (isObject(arg)) {
      for (var option in arg) {
        base[option] = arg[option];
      }
    }
  }

  return <T & U>base;
}

function isEmpty(value: string|boolean|symbol|number|Array<any>|Object, ownPropertiesOnly: boolean = true): boolean {
  // String, boolean, number that is either '', false respectivelly or null and undefined
  // 0 is a valid "path", as it can refer to either the key of an object, or an array index
  if (!value && value !== 0) {
    return true;
  }

  // Preemptively return as soon as we get something for performance reasons
  if (isArray(value) && value.length === 0) {
    return true;
  } else if (isSymbol(value)) {
    return false;
  } else if (!isString(value)) {
    for (var i in value) {
      if (ownPropertiesOnly === true) {
        // Must have own property to be considered non-empty
        if (_hasOwnProperty.call(value, i)) {
          return false;
        }
      } else {
        // Since it has at least one member, assume non-empty, return immediately
        return false;
      }
    }

    // symbols can't be walked with for in
    /* istanbul ignore else */
    if (_hasSymbols) {
      if (Object.getOwnPropertySymbols(value).length) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function getKey(key: string | symbol): number | string | symbol {
  if (isSymbol(key)) {
    return key;
  }

  // Perf: http://jsperf.com/tostring-vs-typecast-vs

  if (('' + ~~<any>key) === <any>key) {
    // Return the integer if it's a real number
    return ~~(<any>key);
  }

  return key;
}

function ensureExists<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, noThrow: boolean = false, ownPropertiesOnly: boolean = true): any {
  return set(obj, path, value, true, noThrow, ownPropertiesOnly);
}

function set<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, doNotReplace: boolean = false, noThrow: boolean = false, ownPropertiesOnly: boolean = true): any {
  if (noThrow === false && isEmpty(path, ownPropertiesOnly)) {
    throw new ObjectPathError('provided path is empty');
  }

  if (isNumber(path) || isSymbol(path)) {
    path = [path];
  }

  if (isString(path)) {
    path = (<string>path).split('.');
    return set(obj, (<Array<string>>path).map(getKey), value, doNotReplace, noThrow, ownPropertiesOnly);
  }

  var currentPath: any = (<Array<string>>path)[0];

  if ((<Array<string>>path).length === 1) {
    var oldVal = (<any>obj)[currentPath];
    if (oldVal === void 0 || !doNotReplace) {
      obj[currentPath] = value;
    }
    return oldVal;
  }

  if (obj[currentPath] === void 0) {
    if (isNumber((<ObjectPath.PathTypes[]>path)[1])) {
      obj[currentPath] = [];
    } else {
      obj[currentPath] = {};
    }
  }

  return set(obj[currentPath], (<ObjectPath.PathTypes[]>path).slice(1), value, doNotReplace, true, ownPropertiesOnly);
}

function del<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, noThrow: boolean = false, ownPropertiesOnly: boolean = true): O {
  if (noThrow === false && isEmpty(path, ownPropertiesOnly)) {
    throw new ObjectPathError('provided path is empty');
  }

  if (noThrow === false && isEmpty(obj, ownPropertiesOnly)) {
    throw new ObjectPathError('provided object is empty');
  }

  if (isNumber(path) || isSymbol(path)) {
    path = [path];
  }

  if (isString(path)) {
    return del(obj, path.split('.'), noThrow, ownPropertiesOnly);
  }

  var currentPath = getKey((<any>path)[0]);
  var oldVal = obj[currentPath];

  if ((<ObjectPath.PathTypes[]>path).length === 1) {
    if (oldVal !== void 0) {
      if (isNumber(currentPath) && isArray(obj)) {
        (<any>obj).splice(currentPath, 1);
      } else {
        delete obj[currentPath];
      }
    }
  } else {
    if (obj[currentPath] !== void 0) {
      return del(obj[currentPath], (<ObjectPath.PathTypes[]>path).slice(1), false, ownPropertiesOnly);
    }
  }

  return obj;
}

function has<O extends ObjectPath.O>(obj: O, path:  ObjectPath.PathTypes, ownPropertiesOnly: boolean = true): boolean {
  if (isEmpty(obj, ownPropertiesOnly)) {
    throw new ObjectPathError('provided object is empty');
  }

  if (isEmpty(path, ownPropertiesOnly)) {
    throw new ObjectPathError('provided path is empty');
  }

  if (isNumber(path) || isSymbol(path)) {
    path = [path];
  } else if (isString(path)) {
    path = (<string>path).split('.');
  }

  for (var i = 0; i < (<ObjectPath.PathTypes[]>path).length; i++) {
    var j = (<any>path)[i];

    if (isObject(obj) || isArray(obj)) {
      if (ownPropertiesOnly) {
        if (_hasOwnProperty.call(obj, j)) {
          obj = <any>obj[j];
        } else {
          return false;
        }
      } else {
        if (j in obj) {
          obj = obj[j];
        } else {
          return false;
        }
      }
    } else {
      return false;
    }

  }

  return true;
}

function insert<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, at: number = 0, ownPropertiesOnly: boolean = true): void {
  var arr = get(obj, path, void 0, ownPropertiesOnly);
  at = ~~at;
  if (!isArray(arr)) {
    arr = [];
    set(obj, path, arr, false, ownPropertiesOnly);
  }
  arr.splice(at, 0, value);
}

function empty<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, noThrow: boolean = false, ownPropertiesOnly: boolean = true): any {
  var value: any = get(obj, path, Number.NaN, noThrow, ownPropertiesOnly);

  if (value !== value) {
    return void 0;
  }

  if (isString(value)) {
    return set(obj, path, '', false, noThrow, ownPropertiesOnly);
  } else if (isBoolean(value)) {
    return set(obj, path, false, false, noThrow, ownPropertiesOnly);
  } else if (isNumber(value)) {
    return set(obj, path, 0, false, noThrow, ownPropertiesOnly);
  } else if (isArray(value)) {
    value.length = 0;
  } else if (isObject(value)) {
    for (var i in value) {
      if (ownPropertiesOnly === true) {
        if (_hasOwnProperty.call(value, i)) {
          delete value[i];
        }
      } else {
        delete value[i];
      }
    }

    /* istanbul ignore else */
    if (_hasSymbols) {
      var symbols: symbol[] = Object.getOwnPropertySymbols(value);
      if (symbols.length) {
        for (var x = 0; x < symbols.length; x++) {
          delete value[symbols[x]];
        }
      }
    }
  } else {
    return set(obj, path, null, false, noThrow, ownPropertiesOnly);
  }
}

function push<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, args: Array<any>, noThrow: boolean = false, ownPropertiesOnly: boolean = true): void {
  if (!isArray(args)) {
    throw new ObjectPathError('3rd parameter "args" must be an array');
  }

  var arr: any[] = get(obj, path, void 0, noThrow, ownPropertiesOnly);
  if (!isArray(arr)) {
    arr = [];
    set(obj, path, arr, false, ownPropertiesOnly);
  }

  Array.prototype.push.apply(arr, args);
}

function coalesce<O extends ObjectPath.O, T>(obj: O, paths: ObjectPath.PathTypes[], defaultValue: T, noThrow: boolean = false, ownPropertiesOnly: boolean = true): T {
  var value: any;

  for (var i = 0, len = paths.length; i < len; i++) {
    value = get(obj, paths[i], Number.NaN, noThrow, ownPropertiesOnly);

    // looks silly but NaN is never equal to itself, it's a good unique value
    if (value === value) {
      return value;
    }
  }

  return defaultValue;
}

function get<O extends ObjectPath.O, T>(obj: O, path: ObjectPath.PathTypes, defaultValue: T, noThrow: boolean = false, ownPropertiesOnly: boolean = true): T {
  if (isEmpty(obj, ownPropertiesOnly)) {
    if (noThrow === true) {
      return defaultValue;
    }
    throw new ObjectPathError('provided object is empty');
  }

  if (isNumber(path) || isSymbol(path)) {
    path = [path];
  }

  if (isString(path)) {
    return get(obj, path.split('.'), defaultValue, noThrow, ownPropertiesOnly);
  }

  if (isEmpty(path, ownPropertiesOnly)) {
    if (noThrow === true) {
      return defaultValue;
    }
    throw new ObjectPathError('provided path is empty');
  }

  var currentPath = getKey((<any>path)[0]);

  if ((<ObjectPath.PathTypes[]>path).length === 1) {
    if (obj[currentPath] === void 0) {
      return defaultValue;
    }
    return obj[currentPath];
  }

  return get(obj[currentPath], (<ObjectPath.PathTypes[]>path).slice(1), defaultValue, true, ownPropertiesOnly);
}

var skipProps: any = {
  bind: true,
  extend: true
};

var objectPath: ObjectPath.Wrapper = {
  ObjectPathError,
  get,
  set,
  coalesce,
  push,
  ensureExists,
  empty,
  del,
  insert,
  has,
  bind,
  extend
}

function bind<O extends ObjectPath.O>(obj: O, noThrow: boolean = false, ownPropertiesOnly: boolean = true): ObjectPath.Bound<O> {
  if (noThrow === false && isEmpty(obj, ownPropertiesOnly)) {
    throw new ObjectPathError('provided object is empty');
  }

  var funcNames: any = [];

  for (var x in objectPath) {
    if (!(x in skipProps) && typeof (<any>objectPath)[x] === 'function') {
      funcNames.push(x);
    }
  }

  return funcNames.reduce(function(proxy: any, prop: string) {
    /* Function.prototype.bind is easier, but much slower in V8 (aka node/chrome) */
    proxy[prop] = function() {
      var args = [obj]
      Array.prototype.push.apply(args, arguments)
      return (<any>objectPath)[prop].apply(objectPath, args)
    }
    return proxy
  }, {})
}

function extend(ctor: ObjectPath.Extender, noConflict: boolean = false): ObjectPath.Wrapper {
  var base: ObjectPath.ExtenderBase = {
    set,
    merge,
    coalesce,
    del,
    empty,
    ensureExists,
    isSymbol,
    get,
    getKey,
    has,
    insert,
    isArray,
    isBoolean,
    isEmpty,
    isNumber,
    isObject,
    isString,
    push
  };

  if (noConflict === true) {
    return merge<{}, ObjectPath.Wrapper>({}, objectPath, ctor(base));
  } else {
    merge(objectPath, ctor(base));

    return objectPath;
  }
}

export = objectPath;