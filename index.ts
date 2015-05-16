//(function (root, factory){
//    'use strict';
//
//    /* istanbul ignore next */
//    if (typeof module === 'object' && typeof module.exports === 'object') {
//        module.exports = factory();
//    } else if (typeof define === 'function' && define.amd) {
//    // AMD. Register as an anonymous module.
//        define([], factory);
//    } else {
//    // Browser globals
//        root.objectPath = factory();
//    }
//})(this, function(){

module ObjectPath {
  'use strict';
  
  var
    toStr = Object.prototype.toString,
    _hasOwnProperty = Object.prototype.hasOwnProperty;
  
  const defaultOptions: ObjectPathModule.IObjectPathOptions = {
    numberAsArray: true,
    ownPropertiesOnly: true
  };
  
  function merge(base: any, ...args: any[]): any {
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
  
  function isEmpty(value: any, ownPropertiesOnly: boolean): boolean {
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
  
  function ensureExists(obj: any, path: any, value: any, options: ObjectPathModule.IObjectPathOptions): any {
    return set(obj, path, value, true, options);
  }
  
  function set(obj: any, path: any, value: any, doNotReplace: boolean, options: ObjectPathModule.IObjectPathOptions): any {
    if (isNumber(path)) {
      path = [path];
    }
    
    if (isEmpty(path, options.ownPropertiesOnly)) {
      return obj;
    }
    
    if (isString(path)) {
      path = path.split('.');
      return set(obj, (!options.numberAsArray ? path : path.map(getKey)), value, doNotReplace, options);
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
      if(isNumber(path[1])) {
        // Check if we assume an array per provided options, numberAsArray
        obj[currentPath] = [];
      } else {
        obj[currentPath] = {};
      }
    }
  
    return set(obj[currentPath], path.slice(1), value, doNotReplace, options);
  }
  
  function del(obj: any, path: any, ownPropertiesOnly: boolean): any {
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
  
  function has(obj: any, path: any, ownPropertiesOnly: boolean): boolean {
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
  
  function insert(obj: any, path: any, value: any, at: number, options: ObjectPathModule.IObjectPathOptions): void {
    var arr = get<any[]>(obj, path, void 0, options.ownPropertiesOnly);
    at = ~~at;
    if (!isArray(arr)) {
      arr = [];
      set(obj, path, arr, false, options);
    }
    arr.splice(at, 0, value);
  }
  
  function empty(obj: any, path: any, options: ObjectPathModule.IObjectPathOptions): any {
    if (isEmpty(path, options.ownPropertiesOnly)) {
      return obj;
    }
    if (isEmpty(obj, options.ownPropertiesOnly)) {
      return void 0;
    }
  
    var value: any;
    
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
      for (let i in value) {
        if (_hasOwnProperty.call(value, i)) {
          delete value[i];
        }
      }
    } else {
      return set(obj, path, null, false, options);
    }
  }
  
  function push(obj: any, path: any, ...args: any[]): void {
    var options: ObjectPathModule.IObjectPathOptions = args[args.length-1];
    
    if (isObject(options)) {
      if (!('ownPropertiesOnly' in options)) {
        options = defaultOptions;
      } else {
        args.pop();
      }
    } else {
      options = defaultOptions;
    }
    
    var arr = get(obj, path, void 0, options.ownPropertiesOnly);
    if (!isArray(arr)) {
      arr = [];
      set(obj, path, arr, false, options);
    }
  
    arr.push.apply(arr, args);
  }
  
  function coalesce<T>(obj: any, paths: any, defaultValue: T, ownPropertiesOnly: boolean): T {
    var value: any;
  
    for (var i = 0, len = paths.length; i < len; i++) {
      if ((value = get(obj, paths[i], void 0, ownPropertiesOnly)) !== void 0) {
        return value;
      }
    }
  
    return defaultValue;
  }
  
  function get<T>(obj: any, path: any, defaultValue: T, ownPropertiesOnly: boolean): T {
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
  
  export class Class implements ObjectPathModule.IObjectPath {
    public options: ObjectPathModule.IObjectPathOptions;
    public Class: typeof Class = Class;
    
    constructor(options?: ObjectPathModule.IObjectPathOptions) { 
      this.options = merge({}, defaultOptions, options);
    }
    
    public set(obj: Object, path: ObjectPathModule.IObjectPathPathTypes, value: any, doNotReplace: boolean) {
      return set(obj, path, value, doNotReplace, this.options);
    }
    
    public ensureExists(obj: Object, path: ObjectPathModule.IObjectPathPathTypes, value: any) {
      return ensureExists(obj, path, value, this.options);
    }
  
    public get<T>(obj: Object, path: ObjectPathModule.IObjectPathPathTypes, defaultValue?: T): T {
      return get<T>(obj, path, defaultValue, this.options.ownPropertiesOnly);
    }
    
    public del(obj: Object, path: ObjectPathModule.IObjectPathPathTypes) {
      return del(obj, path, this.options.ownPropertiesOnly);
    }
    
    public option(options: ObjectPathModule.IObjectPathOptions): ObjectPathModule.IObjectPath {
      merge(this.options, options);
      return this;
    }
    
    public extend(ctor: ObjectPathModule.IObjectPathExtender): ObjectPathModule.IObjectPath {
      var base: ObjectPathModule.IObjectPathExtenderBase = {
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
    
    public has(obj: Object, path: ObjectPathModule.IObjectPathPathTypes) {
      return has(obj, path, this.options.ownPropertiesOnly);
    }
    
    public coalesce(obj: Object, paths: ObjectPathModule.IObjectPathPathTypes[], defaultValue: any) {
      return coalesce(obj, paths, defaultValue, this.options.ownPropertiesOnly);
    }
    
    public push(obj: Object, path: ObjectPathModule.IObjectPathPathTypes, ...args: any[]): ObjectPathModule.IObjectPath {
      push.apply(void 0, [obj, path].concat(args, this.options));
      return this;
    }
    
    public insert(obj: Object, path: ObjectPathModule.IObjectPathPathTypes, value: any, at: number): ObjectPathModule.IObjectPath {
      insert(obj, path, value, at, this.options);
      return this;
    }
    
    public empty(obj: Object, path: ObjectPathModule.IObjectPathPathTypes) {
      return empty(obj, path, this.options);
    }
    
    public bind(obj: Object): ObjectPathModule.IObjectPathBound {
      var self: any = this, out: any = {}; 
      
      return Object.getOwnPropertyNames(Class.prototype).reduce((proxy, prop) => {
        if (typeof self[prop] === 'function' && !(prop in {'bind': true, 'extend': true, 'option': true})) {
          /* Function.prototype.bind is easier, but much slower in V8 (aka node/chrome) */
          proxy[prop] = function(){ 
            var args = [obj];
            Array.prototype.push.apply(args, arguments);
            return self[prop].apply(self, args);
          }
        }
    
        return proxy;
      }, out);
    }
  }
  
}

//    return new ObjectPath.Class();
//});