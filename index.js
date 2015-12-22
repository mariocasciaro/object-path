(function (factory) {

  if (typeof module === 'object' && typeof module.exports === 'object') {
    var v = factory(require, exports);

    if (v !== undefined) {
      module.exports = v;
    }
  } else if (typeof define === 'function' && define.amd) {
    define(['require', 'exports'], factory);
  }

})(function (require, exports) {
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
  var toStr = Object.prototype.toString;

  var _hasOwnProperty = Object.prototype.hasOwnProperty;

  var _hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator !== 'undefined';

  exports.defaultOptions = {
    numberAsArray: true,
    ownPropertiesOnly: true
  };

  function toString (type) {
    return toStr.call(type);
  }

  exports.toString = toString;

  function isNumber (value) {
    return typeof value === 'number' || toString(value) === '[object Number]';
  }

  exports.isNumber = isNumber;

  function isString (obj) {
    return typeof obj === 'string' || toString(obj) === '[object String]';
  }

  exports.isString = isString;

  function isObject (obj) {
    return typeof obj === 'object' && toString(obj) === '[object Object]';
  }

  exports.isObject = isObject;

  function isSymbol (obj) {
    return _hasSymbols && (typeof obj === 'symbol' || toString(obj) === '[object Symbol]');
  }

  exports.isSymbol = isSymbol;

  function isArray (obj) {
    return typeof obj === 'object' && typeof obj.length === 'number' && toString(obj) === '[object Array]';
  }

  exports.isArray = isArray;

  function isBoolean (obj) {
    return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
  }

  exports.isBoolean = isBoolean;

  function merge (base) {
    var args = [];

    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }

    if (!isObject(base)) {
      base = {};
    }

    for (var _a = 0; _a < args.length; _a++) {
      var arg = args[_a];

      if (isObject(arg)) {
        for (var option in arg) {
          base[option] = arg[option];
        }
      }
    }

    return base;
  }

  exports.merge = merge;

  function isEmpty (value, ownPropertiesOnly) {
    if (ownPropertiesOnly === void 0) {
      ownPropertiesOnly = exports.defaultOptions.ownPropertiesOnly;
    }

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

  exports.isEmpty = isEmpty;

  function getKey (key) {
    if (isSymbol(key)) {
      return key;
    }

    var intKey = parseInt(key, 10);

    if (intKey.toString() === key) {
      // Return the integer if it's a real number

      return intKey;
    }

    return key;
  }

  exports.getKey = getKey;

  function ensureExists (obj, path, value, ownPropertiesOnly, numberAsArray) {
    if (ownPropertiesOnly === void 0) {
      ownPropertiesOnly = exports.defaultOptions.ownPropertiesOnly;
    }

    if (numberAsArray === void 0) {
      numberAsArray = exports.defaultOptions.numberAsArray;
    }

    return set(obj, path, value, true, ownPropertiesOnly, numberAsArray);
  }

  exports.ensureExists = ensureExists;

  function set (obj, path, value, doNotReplace, ownPropertiesOnly, numberAsArray) {
    if (ownPropertiesOnly === void 0) {
      ownPropertiesOnly = exports.defaultOptions.ownPropertiesOnly;
    }

    if (numberAsArray === void 0) {
      numberAsArray = exports.defaultOptions.numberAsArray;
    }

    if (isNumber(path) || isSymbol(path)) {
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

      if (typeof oldVal === 'undefined' || !doNotReplace) {
        obj[currentPath] = value;
      }

      return oldVal;
    }

    if (typeof obj[currentPath] === 'undefined') {
      if (isNumber(path[1])) {
        // Check if we assume an array per provided options, numberAsArray

        obj[currentPath] = [];
      } else {
        obj[currentPath] = {};
      }
    }

    return set(obj[currentPath], path.slice(1), value, doNotReplace, ownPropertiesOnly, numberAsArray);
  }

  exports.set = set;

  function del (obj, path, ownPropertiesOnly) {
    if (ownPropertiesOnly === void 0) {
      ownPropertiesOnly = exports.defaultOptions.ownPropertiesOnly;
    }

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

    var currentPath = getKey(path[0]);
    var oldVal = obj[currentPath];

    if (path.length === 1) {
      if (typeof oldVal !== 'undefined') {
        if (isArray(obj)) {
          obj.splice(currentPath, 1);
        } else {
          delete obj[currentPath];
        }
      }
    } else {
      if (typeof obj[currentPath] !== 'undefined') {
        return del(obj[currentPath], path.slice(1), ownPropertiesOnly);
      }
    }

    return obj;
  }

  exports.del = del;

  function has (obj, path, ownPropertiesOnly) {
    if (ownPropertiesOnly === void 0) {
      ownPropertiesOnly = exports.defaultOptions.ownPropertiesOnly;
    }

    if (isEmpty(obj, ownPropertiesOnly)) {
      return false;
    }

    if (isNumber(path) || isSymbol(path)) {
      path = [path];
    } else if (isString(path)) {
      path = path.split('.');
    }

    if (isEmpty(path, ownPropertiesOnly)) {
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

  exports.has = has;

  function insert (obj, path, value, at, ownPropertiesOnly, numberAsArray) {
    if (ownPropertiesOnly === void 0) {
      ownPropertiesOnly = exports.defaultOptions.ownPropertiesOnly;
    }

    if (numberAsArray === void 0) {
      numberAsArray = exports.defaultOptions.numberAsArray;
    }

    var arr = get(obj, path, void 0, ownPropertiesOnly);

    at = ~~at;

    if (!isArray(arr)) {
      arr = [];
      set(obj, path, arr, false, ownPropertiesOnly, numberAsArray);
    }

    arr.splice(at, 0, value);
  }

  exports.insert = insert;

  function empty (obj, path, ownPropertiesOnly, numberAsArray) {
    if (ownPropertiesOnly === void 0) {
      ownPropertiesOnly = exports.defaultOptions.ownPropertiesOnly;
    }

    if (numberAsArray === void 0) {
      numberAsArray = exports.defaultOptions.numberAsArray;
    }

    if (isEmpty(path, ownPropertiesOnly)) {
      return obj;
    }

    if (isEmpty(obj, ownPropertiesOnly)) {
      return void 0;
    }

    var value = get(obj, path, Number.NaN, ownPropertiesOnly);

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
        var symbols = Object.getOwnPropertySymbols(value);

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

  exports.empty = empty;

  function push (obj, path, args, ownPropertiesOnly, numberAsArray) {
    if (ownPropertiesOnly === void 0) {
      ownPropertiesOnly = exports.defaultOptions.ownPropertiesOnly;
    }

    if (numberAsArray === void 0) {
      numberAsArray = exports.defaultOptions.numberAsArray;
    }

    var arr = get(obj, path, void 0, ownPropertiesOnly);

    if (!isArray(arr)) {
      arr = [];
      set(obj, path, arr, false, ownPropertiesOnly, numberAsArray);
    }

    if (!isArray(args)) {
      args = [args];
    }

    arr.push.apply(arr, args);
  }

  exports.push = push;

  function coalesce (obj, paths, defaultValue, ownPropertiesOnly) {
    if (ownPropertiesOnly === void 0) {
      ownPropertiesOnly = exports.defaultOptions.ownPropertiesOnly;
    }

    var value;

    for (var i = 0, len = paths.length; i < len; i++) {
      value = get(obj, paths[i], Number.NaN, ownPropertiesOnly);
      // looks silly but NaN is never equal to itself, it's a good unique value

      if (value === value) {
        return value;
      }
    }

    return defaultValue;
  }

  exports.coalesce = coalesce;

  function get (obj, path, defaultValue, ownPropertiesOnly) {
    if (ownPropertiesOnly === void 0) {
      ownPropertiesOnly = exports.defaultOptions.ownPropertiesOnly;
    }

    if (isNumber(path) || isSymbol(path)) {
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
      if (typeof obj[currentPath] === 'undefined') {
        return defaultValue;
      }

      return obj[currentPath];
    }

    return get(obj[currentPath], path.slice(1), defaultValue, ownPropertiesOnly);
  }

  exports.get = get;
  var skipProps = {'bind': true,'extend': true,'option': true};

  function bind (obj, from) {
    var funcNames = [];
    var base;

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

    return funcNames.reduce(function (proxy, prop) {
      /* Function.prototype.bind is easier, but much slower in V8 (aka node/chrome) */

      proxy[prop] = function () {
        var args = [obj];

        Array.prototype.push.apply(args, arguments);

        return base[prop].apply(base, args);
      };

      return proxy;
    }, {});
  }

  exports.bind = bind;
  var Class = (function () {

    function Class (options) {
      this.options = merge({}, exports.defaultOptions, options);
    }

    Class.prototype.set = function (obj, path, value, doNotReplace) {

      return set(obj, path, value, doNotReplace, this.options.ownPropertiesOnly, this.options.numberAsArray);
    };

    Class.prototype.ensureExists = function (obj, path, value) {

      return ensureExists(obj, path, value, this.options.ownPropertiesOnly, this.options.numberAsArray);
    };

    Class.prototype.get = function (obj, path, defaultValue) {

      return get(obj, path, defaultValue, this.options.ownPropertiesOnly);
    };

    Class.prototype.del = function (obj, path) {

      return del(obj, path, this.options.ownPropertiesOnly);
    };

    Class.prototype.option = function (options) {
      merge(this.options, options);

      return this;
    };

    Class.prototype.extend = function (ctor) {
      var base = {
        set: set,
        merge: merge,
        coalesce: coalesce,
        del: del,
        empty: empty,
        ensureExists: ensureExists,
        isSymbol: isSymbol,
        get: get,
        getKey: getKey,
        has: has,
        insert: insert,
        isArray: isArray,
        isBoolean: isBoolean,
        isEmpty: isEmpty,
        isNumber: isNumber,
        isObject: isObject,
        isString: isString,
        push: push
      };

      merge(this, ctor(base, this.options));

      return this;
    };

    Class.prototype.has = function (obj, path) {

      return has(obj, path, this.options.ownPropertiesOnly);
    };

    Class.prototype.coalesce = function (obj, paths, defaultValue) {

      return coalesce(obj, paths, defaultValue, this.options.ownPropertiesOnly);
    };

    Class.prototype.push = function (obj, path, args) {
      push(obj, path, args, this.options.ownPropertiesOnly, this.options.numberAsArray);

      return this;
    };

    Class.prototype.insert = function (obj, path, value, at) {
      insert(obj, path, value, at, this.options.ownPropertiesOnly, this.options.numberAsArray);

      return this;
    };

    Class.prototype.empty = function (obj, path) {

      return empty(obj, path, this.options.ownPropertiesOnly, this.options.numberAsArray);
    };

    Class.prototype.bind = function (obj) {

      return bind(obj, this);
    };

    return Class;
  })();

  exports.Class = Class;

  exports.instance = new Class();
});