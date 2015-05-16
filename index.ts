'use strict';

var
  toStr = Object.prototype.toString,
  _hasOwnProperty = Object.prototype.hasOwnProperty;

export interface IObjectPathOptions {
  /**
   * Treat numbers in string paths as arrays when setting properties
   */
  numberAsArray?: boolean;
  /**
   * When set to false, can access non-enumerables
   */
  ownPropertiesOnly?: boolean;
}

export interface IObjectPath {
  new (options?: IObjectPathOptions): IObjectPath;
  options: IObjectPathOptions;
}

export type IObjectPathPathTypes = Array<string|number>|number|string;

export interface IObjectPathExtender {
  (base: IObjectPath): Object;
}

const defaultOptions: IObjectPathOptions = {
  numberAsArray: true,
  ownPropertiesOnly: true
};

function merge(base: Object, ...args: Object[]) {
  if (!isObject(base)) {
    base = {};
  }
  
  for (let arg of args) {
    if (isObject(arg)) {
      for (let option in arg) {
        base[option] = arg[option];
      }
    }
  }
  
  return base;
}

function isEmpty(value: any, ownPropertiesOnly: boolean){
  // String, boolean, number that is either '', false or 0 respectivelly or null and undefined
  if (!value) {
    return true;
  }
  
  if (isArray(value) && value.length === 0) {
    return true;
  } else if (!isString(value)) {
    for (let i in value) {
      if (ownPropertiesOnly === true){
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

function toString(type: any): string {
  return toStr.call(type);
}

function isNumber(value: any): boolean {
  return typeof value === 'number' || toString(value) === "[object Number]";
}

function isString(obj: any): boolean {
  return typeof obj === 'string' || toString(obj) === "[object String]";
}

function isObject(obj: any): boolean {
  return typeof obj === 'object' && toString(obj) === "[object Object]";
}

function isArray(obj: any): boolean {
  return typeof obj === 'object' && typeof obj.length === 'number' && toString(obj) === '[object Array]';
}

function isBoolean(obj: any): boolean {
  return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
}

function getKey(key: string): number|string {
  var intKey = parseInt(key, 10);
  
  if (intKey.toString() === key) {
    // Return the integer if it's a real number
    return intKey;
  }
  
  return key;
}

function ensureExists(obj: any, path: any, value: any, options: IObjectPathOptions) {
  return set(obj, path, value, true, options);
}

function set(obj: any, path: any, value: any, doNotReplace: boolean, options: IObjectPathOptions) {
  if (isNumber(path)) {
    path = [path];
  }
  
  if (isEmpty(path, options.ownPropertiesOnly)) {
    return obj;
  }
  
  if (isString(path)) {
    return set(obj, path.split('.').map(getKey), value, doNotReplace, options);
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
    // Check if we assume an array per provided options
    if(isNumber(path[1])) {
      obj[currentPath] = [];
    } else {
      obj[currentPath] = {};
    }
  }

  return set(obj[currentPath], path.slice(1), value, doNotReplace, options);
}

function del(obj: any, path: any, ownPropertiesOnly: boolean) {
  if (isNumber(path)) {
    path = [path];
  }

  if (isEmpty(obj, ownPropertiesOnly)) {
    return void 0;
  }

  if (isEmpty(path, ownPropertiesOnly)) {
    return obj;
  }
  
  if(isString(path)) {
    return del(obj, path.split('.'), ownPropertiesOnly);
  }

  var currentPath = getKey(path[0]);
  var oldVal = obj[currentPath];

  if(path.length === 1) {
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

function has(obj: any, path: any, ownPropertiesOnly: boolean = true) {
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
        }
      }
    } else {
      return false;
    }
    
  }

  return true;
}

function insert(obj: any, path: any, value: any, at: number, options: IObjectPathOptions) {
  var arr = get<any[]>(obj, path, void 0, options.ownPropertiesOnly);
  at = ~~at;
  if (!isArray(arr)) {
    arr = [];
    set(obj, path, arr, false, options);
  }
  arr.splice(at, 0, value);
}

function empty(obj, path, options: IObjectPathOptions) {
  if (isEmpty(path, options.ownPropertiesOnly)) {
    return obj;
  }
  if (isEmpty(obj, options.ownPropertiesOnly)) {
    return void 0;
  }

  var value, i;
  if (!(value = get(obj, path, void 0, options.ownPropertiesOnly))) {
    return obj;
  }

  if (isString(value)) {
    return set(obj, path, '', false, options);
  } else if (isBoolean(value)) {
    return set(obj, path, false, false, options);
  } else if (isNumber(value)) {
    return set(obj, path, 0, false, options);
  } else if (isArray(value)) {
    value.length = 0;
  } else if (isObject(value)) {
    for (i in value) {
      if (_hasOwnProperty.call(value, i)) {
        delete value[i];
      }
    }
  } else {
    return set(obj, path, null, false, options);
  }
}

function push(obj: any, path: any, ...args: any[]){
  var arr = get(obj, path, void 0);
  if (!isArray(arr)) {
    arr = [];
    set(obj, path, arr, false, {});
  }

  arr.push.apply(arr, args);
};

function coalesce(obj: any, paths: any, defaultValue: any, ownPropertiesOnly?: boolean) {
  var value;

  for (var i = 0, len = paths.length; i < len; i++) {
    if ((value = get(obj, paths[i], void 0, ownPropertiesOnly)) !== void 0) {
      return value;
    }
  }

  return defaultValue;
};

function get<T>(obj: any, path: any, defaultValue?: T, ownPropertiesOnly: boolean = defaultOptions.ownPropertiesOnly): T {
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

export class ObjectPath implements IObjectPath {
  public options: IObjectPathOptions;
  
  constructor(options?: IObjectPathOptions) { 
    this.options = merge({}, defaultOptions, options);
  }
  
  public set(obj: Object, path: IObjectPathPathTypes, value: any, doNotReplace: boolean) {
    return set(obj, path, value, doNotReplace, this.options);
  }
  
  public ensureExists(obj: Object, path: IObjectPathPathTypes, value: any) {
    return ensureExists(obj, path, value, this.options);
  }

  public get<T>(obj: Object, path: IObjectPathPathTypes, defaultValue?: T): T {
    return get<T>(obj, path, defaultValue, this.options.ownPropertiesOnly);
  }
  
  public del(obj: Object, path: IObjectPathPathTypes) {
    return del(obj, path, this.options.ownPropertiesOnly);
  }
  
  public extend(ctor: IObjectPathExtender) {
    return this;
  }
  
  public has(obj: Object, path: IObjectPathPathTypes) {
    return has(obj, path, this.options.ownPropertiesOnly);
  }
  
  public coalesce(obj, paths: IObjectPathPathTypes[], defaultValue) {
    return coalesce(obj, paths, defaultValue, this.options.ownPropertiesOnly);
  }
  
  public push(obj: Object, path: IObjectPathPathTypes, ...args: any[]) {
    return push(obj, path, ...args);
  }
  
  public insert(obj: Object, path: IObjectPathPathTypes, value: any, at: number) {
    return insert(obj, path, value, at, this.options);
  }
  
  /*public bind(obj: Object): IObjectPath {
    return Object.keys(this).reduce((proxy, prop) => {
      if (typeof this[prop] === 'function') {
        /* Function.prototype.bind is easier, but much slower in V8 (aka node/chrome) /
        proxy[prop] = function(){ 
          var args = [obj];
          Array.prototype.push.apply(args, arguments);
          return this[prop].apply(this, args);
        }
      }
  
      return proxy;
    }, {});
  }*/
    
}

export default new ObjectPath();