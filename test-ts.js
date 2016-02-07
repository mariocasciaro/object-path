(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'object-path'], factory);
    }
})(function (require, exports) {
    var objectPath = require('object-path');
    var obj = {
        a: 'a',
        b: ['c', 'd']
    };
    objectPath.set(obj, [1, 2], 'value', false);
    objectPath.get(obj, [Symbol()]);
    objectPath.has(obj, true);
    objectPath.bind({});
});
