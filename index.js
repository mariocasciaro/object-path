
function isEmpty(value) {
  if(!value) {
    return true;
  }
  if(isArray(value) && value.length === 0) {
    return true;
  } else {
    for(var i in value) {
      if(Object.prototype.hasOwnProperty.call(value, i)) {
        return false;
      }
    }
    return true;
  }
}

function isNumber(value) {
  return typeof value == 'number' || Object.prototype.toString.call(value) == "[object Number]";
}

function isString(obj) {
  return typeof obj == 'string' || Object.prototype.toString.call(obj) == "[object String]";
}

function isArray(obj) {
  return typeof obj == 'object' && typeof obj.length == 'number' &&
    Object.prototype.toString.call(obj) == '[object Array]';
}

function getKey(key) {
  var intKey = parseInt(key);
  if (intKey.toString() === key) {
    return intKey;
  }
  return key;
}



function set(obj, path, value, doNotReplace) {
  if(isEmpty(path)) {
    return obj;
  }
  if(isString(path)) {
    return set(obj, path.split('.'), value, doNotReplace);
  }
  var currentPath = getKey(path[0]);
  if(path.length === 1) {
    var oldVal = obj[currentPath];
    if(oldVal === void 0 || !doNotReplace) {
      obj[currentPath] = value;
    }
    return oldVal;
  } else if (path.length > 1) {
    if(obj[currentPath] === void 0) {
      if(isNumber(currentPath)) {
        obj[currentPath] = [];
      } else {
        obj[currentPath] = {};
      }
    }
    return set(obj[currentPath], path.slice(1), value, doNotReplace);
  }

  return undefined;
}


var objectPath = module.exports = {};

objectPath.ensureExists = function(obj, path, value) {
  return set(obj, path, value, true);
};

objectPath.set = function(obj, path, value, doNotReplace) {
  return set(obj, path, value, doNotReplace);
};


objectPath.push = function(obj, path /*, values */) {
  var arr = objectPath.get(obj, path);
  if(!isArray(arr)) {
    arr = [];
    objectPath.set(obj, path, arr);
  }
  var args = Array.prototype.slice.call(arguments, 2);
  arr.push.apply(arr, args);
};


objectPath.get = function(obj, path) {
  if(isEmpty(path)) {
    return obj;
  }
  if(isEmpty(obj)) {
    return undefined;
  }
  if(isString(path)) {
    return objectPath.get(obj, path.split('.'));
  }
  var currentPath = getKey(path[0]);
  if(path.length === 1) {
    return obj[currentPath];
  }
  return objectPath.get(obj[currentPath], path.slice(1));
};
