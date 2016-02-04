(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
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
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var _hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator !== 'undefined';
    var ObjectPathError = (function () {
        function ObjectPathError(message) {
            this.message = message;
            this.name = 'ObjectPathError';
            ReferenceError.call(this, message);
        }
        return ObjectPathError;
    })();
    ObjectPathError.prototype = Object.create(ReferenceError.prototype, {
        constructor: {
            value: ObjectPathError
        }
    });
    function isNumber(value) {
        return typeof value === 'number' && value.constructor === Number;
    }
    function isString(obj) {
        return typeof obj === 'string' && obj.constructor === String;
    }
    function isObject(obj) {
        return typeof obj === 'object' && obj !== null && obj.constructor !== Array;
    }
    function isSymbol(obj) {
        return _hasSymbols && typeof obj === 'symbol' && obj.constructor === Symbol;
    }
    function isArray(obj) {
        return Array.isArray ? Array.isArray(obj) : typeof obj === 'object' && obj !== null && obj.constructor === Array;
    }
    function isBoolean(obj) {
        return typeof obj === 'boolean' && obj.constructor === Boolean;
    }
    function merge(base) {
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
    function isEmpty(value, ownPropertiesOnly) {
        if (ownPropertiesOnly === void 0) { ownPropertiesOnly = true; }
        // String, boolean, number that is either '', false respectivelly or null and undefined
        // 0 is a valid "path", as it can refer to either the key of an object, or an array index
        if (!value && value !== 0) {
            return true;
        }
        // Preemptively return as soon as we get something for performance reasons
        if (isArray(value) && value.length === 0) {
            return true;
        }
        else if (isSymbol(value)) {
            return false;
        }
        else if (!isString(value)) {
            for (var i in value) {
                if (ownPropertiesOnly === true) {
                    // Must have own property to be considered non-empty
                    if (_hasOwnProperty.call(value, i)) {
                        return false;
                    }
                }
                else {
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
    function getKey(key) {
        if (isSymbol(key)) {
            return key;
        }
        // Perf: http://jsperf.com/tostring-vs-typecast-vs
        if (('' + ~~key) === key) {
            // Return the integer if it's a real number
            return ~~key;
        }
        return key;
    }
    function ensureExists(obj, path, value, noThrow, ownPropertiesOnly) {
        if (noThrow === void 0) { noThrow = false; }
        if (ownPropertiesOnly === void 0) { ownPropertiesOnly = true; }
        return set(obj, path, value, true, noThrow, ownPropertiesOnly);
    }
    function set(obj, path, value, doNotReplace, noThrow, ownPropertiesOnly) {
        if (doNotReplace === void 0) { doNotReplace = false; }
        if (noThrow === void 0) { noThrow = false; }
        if (ownPropertiesOnly === void 0) { ownPropertiesOnly = true; }
        if (noThrow === false && isEmpty(path, ownPropertiesOnly)) {
            throw new ObjectPathError('provided path is empty');
        }
        if (isNumber(path) || isSymbol(path)) {
            path = [path];
        }
        if (isString(path)) {
            path = path.split('.');
            return set(obj, path.map(getKey), value, doNotReplace, noThrow, ownPropertiesOnly);
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
                obj[currentPath] = [];
            }
            else {
                obj[currentPath] = {};
            }
        }
        return set(obj[currentPath], path.slice(1), value, doNotReplace, true, ownPropertiesOnly);
    }
    function del(obj, path, noThrow, ownPropertiesOnly) {
        if (noThrow === void 0) { noThrow = false; }
        if (ownPropertiesOnly === void 0) { ownPropertiesOnly = true; }
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
        var currentPath = getKey(path[0]);
        var oldVal = obj[currentPath];
        if (path.length === 1) {
            if (oldVal !== void 0) {
                if (isNumber(currentPath) && isArray(obj)) {
                    obj.splice(currentPath, 1);
                }
                else {
                    delete obj[currentPath];
                }
            }
        }
        else {
            if (obj[currentPath] !== void 0) {
                return del(obj[currentPath], path.slice(1), false, ownPropertiesOnly);
            }
        }
        return obj;
    }
    function has(obj, path, ownPropertiesOnly) {
        if (ownPropertiesOnly === void 0) { ownPropertiesOnly = true; }
        if (isEmpty(obj, ownPropertiesOnly)) {
            throw new ObjectPathError('provided object is empty');
        }
        if (isEmpty(path, ownPropertiesOnly)) {
            throw new ObjectPathError('provided path is empty');
        }
        if (isNumber(path) || isSymbol(path)) {
            path = [path];
        }
        else if (isString(path)) {
            path = path.split('.');
        }
        for (var i = 0; i < path.length; i++) {
            var j = path[i];
            if (isObject(obj) || isArray(obj)) {
                if (ownPropertiesOnly) {
                    if (_hasOwnProperty.call(obj, j)) {
                        obj = obj[j];
                    }
                    else {
                        return false;
                    }
                }
                else {
                    if (j in obj) {
                        obj = obj[j];
                    }
                    else {
                        return false;
                    }
                }
            }
            else {
                return false;
            }
        }
        return true;
    }
    function insert(obj, path, value, at, ownPropertiesOnly) {
        if (at === void 0) { at = 0; }
        if (ownPropertiesOnly === void 0) { ownPropertiesOnly = true; }
        var arr = get(obj, path, void 0, ownPropertiesOnly);
        at = ~~at;
        if (!isArray(arr)) {
            arr = [];
            set(obj, path, arr, false, ownPropertiesOnly);
        }
        arr.splice(at, 0, value);
    }
    function empty(obj, path, noThrow, ownPropertiesOnly) {
        if (noThrow === void 0) { noThrow = false; }
        if (ownPropertiesOnly === void 0) { ownPropertiesOnly = true; }
        var value = get(obj, path, Number.NaN, noThrow, ownPropertiesOnly);
        if (value !== value) {
            return void 0;
        }
        if (isString(value)) {
            return set(obj, path, '', false, noThrow, ownPropertiesOnly);
        }
        else if (isBoolean(value)) {
            return set(obj, path, false, false, noThrow, ownPropertiesOnly);
        }
        else if (isNumber(value)) {
            return set(obj, path, 0, false, noThrow, ownPropertiesOnly);
        }
        else if (isArray(value)) {
            value.length = 0;
        }
        else if (isObject(value)) {
            for (var i in value) {
                if (ownPropertiesOnly === true) {
                    if (_hasOwnProperty.call(value, i)) {
                        delete value[i];
                    }
                }
                else {
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
        }
        else {
            return set(obj, path, null, false, noThrow, ownPropertiesOnly);
        }
    }
    function push(obj, path, args, noThrow, ownPropertiesOnly) {
        if (noThrow === void 0) { noThrow = false; }
        if (ownPropertiesOnly === void 0) { ownPropertiesOnly = true; }
        if (!isArray(args)) {
            throw new ObjectPathError('3rd parameter "args" must be an array');
        }
        var arr = get(obj, path, void 0, noThrow, ownPropertiesOnly);
        if (!isArray(arr)) {
            arr = [];
            set(obj, path, arr, false, ownPropertiesOnly);
        }
        Array.prototype.push.apply(arr, args);
    }
    function coalesce(obj, paths, defaultValue, noThrow, ownPropertiesOnly) {
        if (noThrow === void 0) { noThrow = false; }
        if (ownPropertiesOnly === void 0) { ownPropertiesOnly = true; }
        var value;
        for (var i = 0, len = paths.length; i < len; i++) {
            value = get(obj, paths[i], Number.NaN, noThrow, ownPropertiesOnly);
            // looks silly but NaN is never equal to itself, it's a good unique value
            if (value === value) {
                return value;
            }
        }
        return defaultValue;
    }
    function get(obj, path, defaultValue, noThrow, ownPropertiesOnly) {
        if (noThrow === void 0) { noThrow = false; }
        if (ownPropertiesOnly === void 0) { ownPropertiesOnly = true; }
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
        var currentPath = getKey(path[0]);
        if (path.length === 1) {
            if (obj[currentPath] === void 0) {
                return defaultValue;
            }
            return obj[currentPath];
        }
        return get(obj[currentPath], path.slice(1), defaultValue, true, ownPropertiesOnly);
    }
    var skipProps = {
        bind: true,
        extend: true
    };
    var objectPath = {
        ObjectPathError: ObjectPathError,
        get: get,
        set: set,
        coalesce: coalesce,
        push: push,
        ensureExists: ensureExists,
        empty: empty,
        del: del,
        insert: insert,
        has: has,
        bind: bind,
        extend: extend
    };
    function bind(obj, noThrow, ownPropertiesOnly) {
        if (noThrow === void 0) { noThrow = false; }
        if (ownPropertiesOnly === void 0) { ownPropertiesOnly = true; }
        if (noThrow === false && isEmpty(obj, ownPropertiesOnly)) {
            throw new ObjectPathError('provided object is empty');
        }
        var funcNames = [];
        for (var x in objectPath) {
            if (!(x in skipProps) && typeof objectPath[x] === 'function') {
                funcNames.push(x);
            }
        }
        return funcNames.reduce(function (proxy, prop) {
            /* Function.prototype.bind is easier, but much slower in V8 (aka node/chrome) */
            proxy[prop] = function () {
                var args = [obj];
                Array.prototype.push.apply(args, arguments);
                return objectPath[prop].apply(objectPath, args);
            };
            return proxy;
        }, {});
    }
    function extend(ctor, noConflict) {
        if (noConflict === void 0) { noConflict = false; }
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
        if (noConflict === true) {
            return merge({}, objectPath, ctor(base));
        }
        else {
            merge(objectPath, ctor(base));
            return objectPath;
        }
    }
    return objectPath;
});
