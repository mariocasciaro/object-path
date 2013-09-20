
function isEmpty(value) {
  if(!value) {
    return true;
  }
  if(isArray(value) && value.length === 0) {
    return true;
  } else {
    for(var i in value) {
      if(value.hasOwnProperty(i)) {
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


var objectPath = module.exports = {};
objectPath.set = function(obj, path, value) {
  if(!path) {
    return;
  }
  if(isString(path)) {
    objectPath.set(obj, path.split('.'), value);
    return;
  }
  var currentPath = isNaN(parseInt(path[0])) ? path[0] : parseInt(path[0]);
  if(path.length === 1) {
    obj[currentPath] = value;
  } else if (path.length > 1) {
    if(obj[currentPath] === void 0) {
      if(isNumber(currentPath)) {
        obj[currentPath] = [];
      } else {
        obj[currentPath] = {};
      }
    }
    objectPath.set(obj[currentPath], path.slice(1), value);
  }
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
  var currentPath = isNaN(parseInt(path[0])) ? path[0] : parseInt(path[0]);
  if(path.length === 1) {
    return obj[currentPath];
  }
  return objectPath.get(obj[currentPath], path.slice(1));
};
