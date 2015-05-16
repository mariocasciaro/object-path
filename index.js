(function (root, factory){
    'use strict';
    
    /*istanbul ignore next:cant test*/
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
        define([], factory);
    } else {
    // Browser globals
        root.objectPath = factory();
    }
})(this, function(){
    var ObjectPath;
    (function (ObjectPath) {
    'use strict';
    var toStr = Object.prototype.toString, _hasOwnProperty = Object.prototype.hasOwnProperty;
    var defaultOptions = {
        numberAsArray: true,
        ownPropertiesOnly: true
    };
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
        // String, boolean, number that is either '', false or 0 respectivelly or null and undefined
        if (!value) {
            return true;
        }
        if (isArray(value) && value.length === 0) {
            return true;
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
            return true;
        }
        return false;
    }
    function toString(type) {
        return toStr.call(type);
    }
    function isNumber(value) {
        return typeof value === 'number' || toString(value) === "[object Number]";
    }
    function isString(obj) {
        return typeof obj === 'string' || toString(obj) === "[object String]";
    }
    function isObject(obj) {
        return typeof obj === 'object' && toString(obj) === "[object Object]";
    }
    function isArray(obj) {
        return typeof obj === 'object' && typeof obj.length === 'number' && toString(obj) === '[object Array]';
    }
    function isBoolean(obj) {
        return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
    }
    function getKey(key) {
        var intKey = parseInt(key, 10);
        if (intKey.toString() === key) {
            // Return the integer if it's a real number
            return intKey;
        }
        return key;
    }
    function ensureExists(obj, path, value, options) {
        return set(obj, path, value, true, options);
    }
    function set(obj, path, value, doNotReplace, options) {
        if (isNumber(path)) {
            path = [path];
        }
        if (isEmpty(path, options.ownPropertiesOnly)) {
            return obj;
        }
        if (isString(path)) {
            path = path.split('.');
            return set(obj, (options.numberAsArray ? path.map(getKey) : path), value, doNotReplace, options);
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
            }
            else {
                obj[currentPath] = {};
            }
        }
        return set(obj[currentPath], path.slice(1), value, doNotReplace, options);
    }
    function del(obj, path, ownPropertiesOnly) {
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
                }
                else {
                    delete obj[currentPath];
                }
            }
        }
        else {
            if (obj[currentPath] !== void 0) {
                return del(obj[currentPath], path.slice(1), ownPropertiesOnly);
            }
        }
        return obj;
    }
    function has(obj, path, ownPropertiesOnly) {
        if (isEmpty(obj, ownPropertiesOnly)) {
            return false;
        }
        if (isNumber(path)) {
            path = [path];
        }
        else if (isString(path)) {
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
                    }
                    else {
                        return false;
                    }
                }
                else {
                    if (j in obj) {
                        obj = obj[j];
                    }
                }
            }
            else {
                return false;
            }
        }
        return true;
    }
    function insert(obj, path, value, at, options) {
        var arr = get(obj, path, void 0, options.ownPropertiesOnly);
        at = ~~at;
        if (!isArray(arr)) {
            arr = [];
            set(obj, path, arr, false, options);
        }
        arr.splice(at, 0, value);
    }
    function empty(obj, path, options) {
        if (isEmpty(path, options.ownPropertiesOnly)) {
            return obj;
        }
        if (isEmpty(obj, options.ownPropertiesOnly)) {
            return void 0;
        }
        var value;
        if (!(value = get(obj, path, void 0, options.ownPropertiesOnly))) {
            return obj;
        }
        if (isString(value)) {
            return set(obj, path, '', false, options);
        }
        else if (isBoolean(value)) {
            return set(obj, path, false, false, options);
        }
        else if (isNumber(value)) {
            return set(obj, path, 0, false, options);
        }
        else if (isArray(value)) {
            value.length = 0;
        }
        else if (isObject(value)) {
            for (var i in value) {
                if (_hasOwnProperty.call(value, i)) {
                    delete value[i];
                }
            }
        }
        else {
            return set(obj, path, null, false, options);
        }
    }
    function push(obj, path) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var options = args[args.length - 1];
        if (isObject(options)) {
            if (!('ownPropertiesOnly' in options)) {
                options = defaultOptions;
            }
            else {
                args.pop();
            }
        }
        var arr = get(obj, path, void 0, options.ownPropertiesOnly);
        if (!isArray(arr)) {
            arr = [];
            set(obj, path, arr, false, options);
        }
        arr.push.apply(arr, args);
    }
    function coalesce(obj, paths, defaultValue, ownPropertiesOnly) {
        var value;
        for (var i = 0, len = paths.length; i < len; i++) {
            if ((value = get(obj, paths[i], void 0, ownPropertiesOnly)) !== void 0) {
                return value;
            }
        }
        return defaultValue;
    }
    function get(obj, path, defaultValue, ownPropertiesOnly) {
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
    var Class = (function () {
        function Class(options) {
            this.options = merge({}, defaultOptions, options);
        }
        Class.prototype.set = function (obj, path, value, doNotReplace) {
            return set(obj, path, value, doNotReplace, this.options);
        };
        Class.prototype.ensureExists = function (obj, path, value) {
            return ensureExists(obj, path, value, this.options);
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
        Class.prototype.push = function (obj, path) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            push.apply(void 0, [obj, path].concat(args, this.options));
            return this;
        };
        Class.prototype.insert = function (obj, path, value, at) {
            insert(obj, path, value, at, this.options);
            return this;
        };
        Class.prototype.empty = function (obj, path) {
            return empty(obj, path, this.options);
        };
        Class.prototype.bind = function (obj) {
            var self = this, out = {};
            return Object.getOwnPropertyNames(Class.prototype).reduce(function (proxy, prop) {
                if (typeof self[prop] === 'function' && !(prop in { 'bind': true, 'extend': true, 'option': true })) {
                    /* Function.prototype.bind is easier, but much slower in V8 (aka node/chrome) */
                    proxy[prop] = function () {
                        var args = [obj];
                        Array.prototype.push.apply(args, arguments);
                        return self[prop].apply(self, args);
                    };
                }
                return proxy;
            }, out);
        };
        Class.Class = Class;
        return Class;
    })();
    ObjectPath.Class = Class;
    })(ObjectPath || (ObjectPath = {}));
    
    return new ObjectPath.Class();
});
