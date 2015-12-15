/*
(function (factory) {
  /* globals define * /
  if (typeof module === 'object' && typeof module.exports === 'object') {
    var v = factory(require, exports)
    if (v !== undefined) module.exports = v
  } else if (typeof define === 'function' && define.amd) {
    define(['require', 'exports'], factory)
  } else {
    var x = {}
    factory(require, x)
    window.ObjectPath = x
    window.objectPath = window.ObjectPath.instance
  }
}
*/
'use strict';

var toStr = Object.prototype.toString
var _hasOwnProperty = Object.prototype.hasOwnProperty

export const defaultOptions: ObjectPath.Options = {
  numberAsArray: true,
  ownPropertiesOnly: true
};

export function merge(base: any, ...args: any[]): any {
  if (!isObject(base)) {
    base = {};
  }

  for (var arg of args) {
    if (isObject(arg)) {
      for (var option in arg) {
        base[option] = arg[option];
      }
    }
  }

  return base;
}

export function isEmpty(value: any, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly): boolean {
  // String, boolean, number that is either '', false or 0 respectivelly or null and undefined
  if (!value) {
    return true;
  }

  if (isArray(value) && value.length === 0) {
    return true;
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
    return true;
  }
  return false;
}

export function toString(type: any): string {
  return toStr.call(type);
}

export function isNumber(value: any): boolean {
  return typeof value === 'number' || toString(value) === "[object Number]";
}

export function isString(obj: any): boolean {
  return typeof obj === 'string' || toString(obj) === "[object String]";
}

export function isObject(obj: any): boolean {
  return typeof obj === 'object' && toString(obj) === "[object Object]";
}

export function isArray(obj: any): boolean {
  return typeof obj === 'object' && typeof obj.length === 'number' && toString(obj) === '[object Array]';
}

export function isBoolean(obj: any): boolean {
  return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
}

export function getKey(key: string): number | string {
  var intKey = parseInt(key, 10);

  if (intKey.toString() === key) {
    // Return the integer if it's a real number
    return intKey;
  }

  return key;
}

export function ensureExists(obj: any, path: any, value: any, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly, numberAsArray: boolean = defaultOptions.numberAsArray): any {
  return set(obj, path, value, true, ownPropertiesOnly, numberAsArray);
}

export function set(obj: any, path: any, value: any, doNotReplace: boolean, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly, numberAsArray: boolean = defaultOptions.numberAsArray): any {
  if (isNumber(path)) {
    path = [path];
  }

  if (isEmpty(path, ownPropertiesOnly)) {
    return obj;
  }

  if (isString(path)) {
    path = path.split('.');
    return set(obj, (!numberAsArray ? path : path.map(getKey)), value, doNotReplace, ownPropertiesOnly, numberAsArray);
  }

  var currentPath = path[0];

  if (path.length === 1) {
    var oldVal = obj[currentPath];
    if (oldVal === void 0 || !doNotReplace) {
      obj[currentPath] = value;
    }
    return oldVal;
  }

  if (obj[currentPath] === void 0) {
    if (isNumber(path[1])) {
      // Check if we assume an array per provided options, numberAsArray
      obj[currentPath] = [];
    } else {
      obj[currentPath] = {};
    }
  }

  return set(obj[currentPath], path.slice(1), value, doNotReplace, ownPropertiesOnly, numberAsArray);
}

export function del(obj: any, path: any, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly): any {
  if (isNumber(path)) {
    path = [path];
  }

  if (isEmpty(obj, ownPropertiesOnly)) {
    return void 0;
  }

  if (isEmpty(path, ownPropertiesOnly)) {
    return obj;
  }

  if (isString(path)) {
    return del(obj, path.split('.'), ownPropertiesOnly);
  }

  var currentPath = getKey(path[0]);
  var oldVal = obj[currentPath];

  if (path.length === 1) {
    if (oldVal !== void 0) {
      if (isArray(obj)) {
        obj.splice(currentPath, 1);
      } else {
        delete obj[currentPath];
      }
    }
  } else {
    if (obj[currentPath] !== void 0) {
      return del(obj[currentPath], path.slice(1), ownPropertiesOnly);
    }
  }

  return obj;
}

export function has(obj: any, path: any, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly): boolean {
  if (isEmpty(obj, ownPropertiesOnly)) {
    return false;
  }

  if (isNumber(path)) {
    path = [path];
  } else if (isString(path)) {
    path = path.split('.');
  }

  if (isEmpty(path, ownPropertiesOnly) || path.length === 0) {
    return false;
  }

  for (var i = 0; i < path.length; i++) {
    var j = path[i];

    if (isObject(obj) || isArray(obj)) {
      if (ownPropertiesOnly) {
        if (_hasOwnProperty.call(obj, j)) {
          obj = obj[j];
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

export function insert(obj: any, path: any, value: any, at: number, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly, numberAsArray: boolean = defaultOptions.numberAsArray): void {
  var arr = get<any[]>(obj, path, void 0, ownPropertiesOnly);
  at = ~~at;
  if (!isArray(arr)) {
    arr = [];
    set(obj, path, arr, false, ownPropertiesOnly, numberAsArray);
  }
  arr.splice(at, 0, value);
}

export function empty(obj: any, path: any, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly, numberAsArray: boolean = defaultOptions.numberAsArray): any {
  if (isEmpty(path, ownPropertiesOnly)) {
    return obj;
  }
  if (isEmpty(obj, ownPropertiesOnly)) {
    return void 0;
  }

  var value: any;

  if (!(value = get(obj, path, void 0, ownPropertiesOnly))) {
    return obj;
  }

  if (isString(value)) {
    return set(obj, path, '', false, ownPropertiesOnly, numberAsArray);
  } else if (isBoolean(value)) {
    return set(obj, path, false, false, ownPropertiesOnly, numberAsArray);
  } else if (isNumber(value)) {
    return set(obj, path, 0, false, ownPropertiesOnly, numberAsArray);
  } else if (isArray(value)) {
    value.length = 0;
  } else if (isObject(value)) {
    for (var i in value) {
      if (_hasOwnProperty.call(value, i)) {
        delete value[i];
      }
    }
  } else {
    return set(obj, path, null, false, ownPropertiesOnly, numberAsArray);
  }
}

export function push(obj: any, path: any, args: any[], ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly, numberAsArray: boolean = defaultOptions.numberAsArray): void {
  var arr = get(obj, path, void 0, ownPropertiesOnly);
  if (!isArray(arr)) {
    arr = [];
    set(obj, path, arr, false, ownPropertiesOnly, numberAsArray);
  }

  arr.push.apply(arr, args);
}

export function coalesce<T>(obj: any, paths: any, defaultValue: T, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly): T {
  var value: any;

  for (var i = 0, len = paths.length; i < len; i++) {
    if ((value = get(obj, paths[i], void 0, ownPropertiesOnly)) !== void 0) {
      return value;
    }
  }

  return defaultValue;
}

export function get<T>(obj: any, path: any, defaultValue: T, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly): T {
  if (isNumber(path)) {
    path = [path];
  }

  if (isEmpty(path, ownPropertiesOnly)) {
    return obj;
  }

  if (isEmpty(obj, ownPropertiesOnly)) {
    return defaultValue;
  }

  if (isString(path)) {
    return get(obj, path.split('.'), defaultValue, ownPropertiesOnly);
  }

  var currentPath = getKey(path[0]);

  if (path.length === 1) {
    if (obj[currentPath] === void 0) {
      return defaultValue;
    }
    return obj[currentPath];
  }

  return get(obj[currentPath], path.slice(1), defaultValue, ownPropertiesOnly);
}

var skipProps: any = { 'bind': true, 'extend': true, 'option': true };

export class Class implements ObjectPath.Class {
  public options: ObjectPath.Options;

  constructor(options?: ObjectPath.Options) {
    this.options = merge({}, defaultOptions, options);
  }

  public set(obj: Object, path: ObjectPath.PathTypes, value: any, doNotReplace: boolean) {
    return set(obj, path, value, doNotReplace, this.options.ownPropertiesOnly, this.options.numberAsArray);
  }

  public ensureExists(obj: Object, path: ObjectPath.PathTypes, value: any) {
    return ensureExists(obj, path, value, this.options.ownPropertiesOnly, this.options.numberAsArray);
  }

  public get<T>(obj: Object, path: ObjectPath.PathTypes, defaultValue?: T): T {
    return get<T>(obj, path, defaultValue, this.options.ownPropertiesOnly);
  }

  public del(obj: Object, path: ObjectPath.PathTypes) {
    return del(obj, path, this.options.ownPropertiesOnly);
  }

  public option(options: ObjectPath.Options) {
    merge(this.options, options);
    return this;
  }

  public extend(ctor: ObjectPath.Extender) {
    var base: ObjectPath.ExtenderBase = {
      set,
      merge,
      coalesce,
      del,
      empty,
      ensureExists,
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

    merge(this, ctor(base, this.options));

    return this;
  }

  public has(obj: Object, path: ObjectPath.PathTypes) {
    return has(obj, path, this.options.ownPropertiesOnly);
  }

  public coalesce(obj: Object, paths: ObjectPath.PathTypes[], defaultValue: any) {
    return coalesce(obj, paths, defaultValue, this.options.ownPropertiesOnly);
  }

  public push(obj: Object, path: ObjectPath.PathTypes, ...args: any[]) {
    push(obj, path, args, this.options.ownPropertiesOnly, this.options.numberAsArray);
    return this;
  }

  public insert(obj: Object, path: ObjectPath.PathTypes, value: any, at: number) {
    insert(obj, path, value, at, this.options.ownPropertiesOnly, this.options.numberAsArray);
    return this;
  }

  public empty(obj: Object, path: ObjectPath.PathTypes) {
    return empty(obj, path, this.options.ownPropertiesOnly, this.options.numberAsArray);
  }

  public bind<O>(obj: O): ObjectPath.Bound<O> {
    var self: any = this;
    var out: any = {};
    var funcNames: any = [];

    for (var x in self) {
      if (typeof self[x] === 'function' && skipProps[x] !== true) {
        funcNames.push(x);
      }
    }

    return funcNames.reduce(function(proxy: any, prop: string) {
      /* Function.prototype.bind is easier, but much slower in V8 (aka node/chrome) */
      proxy[prop] = function() {
        var args = [obj]
        Array.prototype.push.apply(args, arguments)
        return self[prop].apply(self, args)
      }
      return proxy
    }, out)
  }
}

export var instance = new Class();
