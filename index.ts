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

var toStr = Object.prototype.toString
var _hasOwnProperty = Object.prototype.hasOwnProperty
var _hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator !== 'undefined'

export const defaultOptions: ObjectPath.Options = {
  numberAsArray: true,
  ownPropertiesOnly: true
};

export class ObjectPathError implements ReferenceError {
  name = 'ObjectPathError';

  constructor(public message: string) {
    ReferenceError.call(this);
  }

}

ObjectPathError.prototype = Object.create(ReferenceError.prototype);

export function toString(type: any): string {
  return toStr.call(type);
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' || toString(value) === '[object Number]';
}

export function isString(obj: any): obj is string {
  return typeof obj === 'string' || toString(obj) === '[object String]';
}

export function isObject(obj: any): obj is Object {
  return typeof obj === 'object' && toString(obj) === '[object Object]';
}

export function isSymbol(obj: any): obj is symbol {
  return _hasSymbols && (typeof obj === 'symbol' || toString(obj) === '[object Symbol]');
}

export function isArray(obj: any): obj is any[] {
  return typeof obj === 'object' && typeof obj.length === 'number' && toString(obj) === '[object Array]';
}

export function isBoolean(obj: any): obj is boolean {
  return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
}

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

export function isEmpty(value: string|boolean|symbol|number|Array<any>|Object, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly): boolean {
  // String, boolean, number that is either '', false or 0 respectivelly or null and undefined
  if (!value) {
    return true;
  }

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

export function getKey(key: string | symbol): number | string | symbol {
  if (isSymbol(key)) {
    return key;
  }

  var intKey = parseInt(<string>key, 10);

  if (intKey.toString() === key) {
    // Return the integer if it's a real number
    return intKey;
  }

  return key;
}

export function ensureExists<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly, numberAsArray: boolean = defaultOptions.numberAsArray): any {
  return set(obj, path, value, true, ownPropertiesOnly, numberAsArray);
}

export function set<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, doNotReplace: boolean = false, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly, numberAsArray: boolean = defaultOptions.numberAsArray): any {
  if (isNumber(path) || isSymbol(path)) {
    path = [path];
  }

  if (isEmpty(path, ownPropertiesOnly)) {
    return obj;
  }

  if (isString(path)) {
    path = (<string>path).split('.');
    return set(obj, (!numberAsArray ? path : (<Array<string>>path).map(getKey)), value, doNotReplace, ownPropertiesOnly, numberAsArray);
  }

  var currentPath: any = (<Array<string>>path)[0];

  if ((<Array<string>>path).length === 1) {
    var oldVal = (<any>obj)[currentPath];
    if (typeof oldVal === 'undefined' || !doNotReplace) {
      obj[currentPath] = value;
    }
    return oldVal;
  }

  if (typeof obj[currentPath] === 'undefined') {
    if (isNumber((<ObjectPath.PathTypes[]>path)[1]) && numberAsArray) {
      // Check if we assume an array per provided options, numberAsArray
      obj[currentPath] = [];
    } else {
      obj[currentPath] = {};
    }
  }

  return set(obj[currentPath], (<ObjectPath.PathTypes[]>path).slice(1), value, doNotReplace, ownPropertiesOnly, numberAsArray);
}

export function del<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly): any {
  if (isNumber(path) || isSymbol(path)) {
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

  var currentPath = getKey((<any>path)[0]);
  var oldVal = obj[currentPath];

  if ((<ObjectPath.PathTypes[]>path).length === 1) {
    if (typeof oldVal !== 'undefined') {
      if (isArray(obj) && isNumber(currentPath)) {
        obj.splice(currentPath, 1);
      } else {
        delete obj[currentPath];
      }
    }
  } else {
    if (typeof obj[currentPath] !== 'undefined') {
      return del(obj[currentPath], (<ObjectPath.PathTypes[]>path).slice(1), ownPropertiesOnly);
    }
  }

  return obj;
}

export function has<O extends ObjectPath.O>(obj: O, path:  ObjectPath.PathTypes, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly): boolean {
  if (isEmpty(obj, ownPropertiesOnly)) {
    return false;
  }

  if (isNumber(path) || isSymbol(path)) {
    path = [path];
  } else if (isString(path)) {
    path = (<string>path).split('.');
  }

  if (isEmpty(path, ownPropertiesOnly)) {
    return false;
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

export function insert<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, at: number = 0, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly, numberAsArray: boolean = defaultOptions.numberAsArray): void {
  var arr = get(obj, path, void 0, ownPropertiesOnly);
  at = ~~at;
  if (!isArray(arr)) {
    arr = [];
    set(obj, path, arr, false, ownPropertiesOnly, numberAsArray);
  }
  arr.splice(at, 0, value);
}

export function empty<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly, numberAsArray: boolean = defaultOptions.numberAsArray): any {
  if (isEmpty(path, ownPropertiesOnly)) {
    return obj;
  }

  if (isEmpty(obj, ownPropertiesOnly)) {
    return void 0;
  }

  var value: any = get(obj, path, Number.NaN, ownPropertiesOnly);

  if (value !== value) {
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
    return set(obj, path, null, false, ownPropertiesOnly, numberAsArray);
  }
}

export function push<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, args: Array<any>, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly, numberAsArray: boolean = defaultOptions.numberAsArray): void {
  var arr: any[] = get(obj, path, void 0, ownPropertiesOnly);
  if (!isArray(arr)) {
    arr = [];
    set(obj, path, arr, false, ownPropertiesOnly, numberAsArray);
  }

  if (!isArray(args)) {
    args = [args];
  }

  Array.prototype.push.apply(arr, args);
}

export function coalesce<O extends ObjectPath.O, T>(obj: O, paths: ObjectPath.PathTypes[], defaultValue: T, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly): T {
  var value: any;

  for (var i = 0, len = paths.length; i < len; i++) {
    value = get(obj, paths[i], Number.NaN, ownPropertiesOnly);
    // looks silly but NaN is never equal to itself, it's a good unique value
    if (value === value) {
      return value;
    }
  }

  return defaultValue;
}

export function get<O extends ObjectPath.O, T>(obj: O, path: ObjectPath.PathTypes, defaultValue: T, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly): T {
  if (isNumber(path) || isSymbol(path)) {
    path = [path];
  }

  if (isEmpty(path, ownPropertiesOnly)) {
    return <any>obj;
  }

  if (isEmpty(obj, ownPropertiesOnly)) {
    return defaultValue;
  }

  if (isString(path)) {
    return get(obj, path.split('.'), defaultValue, ownPropertiesOnly);
  }

  var currentPath = getKey((<any>path)[0]);

  if ((<ObjectPath.PathTypes[]>path).length === 1) {
    if (typeof obj[currentPath] === 'undefined') {
      return defaultValue;
    }
    return obj[currentPath];
  }

  return get(obj[currentPath], (<ObjectPath.PathTypes[]>path).slice(1), defaultValue, ownPropertiesOnly);
}

var skipProps: any = { 'bind': true, 'extend': true, 'option': true };

export function bind<O extends ObjectPath.O>(obj: O, from?: ObjectPath.Class): ObjectPath.Bound<O> {
  var funcNames: any = [];
  var base: any;

  if (typeof from === 'undefined') {
    base = new Class();
  } else {
    base = from;
  }

  for (var x in base) {
    if (typeof base[x] === 'function' && skipProps[x] !== true) {
      funcNames.push(x);
    }
  }

  return funcNames.reduce(function(proxy: any, prop: string) {
    /* Function.prototype.bind is easier, but much slower in V8 (aka node/chrome) */
    proxy[prop] = function() {
      var args = [obj]
      Array.prototype.push.apply(args, arguments)
      return base[prop].apply(base, args)
    }
    return proxy
  }, {})
}

export class Class implements ObjectPath.Class {
  public options: ObjectPath.Options;

  constructor(options?: ObjectPath.Options) {
    this.options = merge({}, defaultOptions, options);
  }

  public set<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, doNotReplace: boolean) {
    return set(obj, path, value, doNotReplace, this.options.ownPropertiesOnly, this.options.numberAsArray);
  }

  public ensureExists<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any) {
    return ensureExists(obj, path, value, this.options.ownPropertiesOnly, this.options.numberAsArray);
  }

  public get<O extends ObjectPath.O, T>(obj: O, path: ObjectPath.PathTypes, defaultValue?: T): T {
    return get(obj, path, defaultValue, this.options.ownPropertiesOnly);
  }

  public del<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes) {
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

    merge(this, ctor(base, this.options));

    return this;
  }

  public has<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes) {
    return has(obj, path, this.options.ownPropertiesOnly);
  }

  public coalesce<O extends ObjectPath.O>(obj: O, paths: ObjectPath.PathTypes[], defaultValue: any) {
    return coalesce(obj, paths, defaultValue, this.options.ownPropertiesOnly);
  }

  public push<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, args: any[]|any) {
    push(obj, path, args, this.options.ownPropertiesOnly, this.options.numberAsArray);

    return this;
  }

  public insert<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, at: number) {
    insert(obj, path, value, at, this.options.ownPropertiesOnly, this.options.numberAsArray);

    return this;
  }

  public empty<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes) {
    return empty(obj, path, this.options.ownPropertiesOnly, this.options.numberAsArray);
  }

  public bind<O extends ObjectPath.O>(obj: O): ObjectPath.Bound<O> {
    return bind(obj, this);
  }
}

export var instance = new Class();
