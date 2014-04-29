/**
 * Utility methods.
 * Some method are a fork of Underscore: https://github.com/jashkenas/underscore
 * by Jeremy Ashkenas: https://github.com/jashkenas/underscore/blob/master/LICENSE
 *
 *
 */
(function () {

    'use strict';

    // ---------------------------------------------
    //          const
    // ---------------------------------------------

    // Establish the object that gets returned to break out of a loop iteration.
    var breaker = {};

    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

    var
        push = ArrayProto.push,
        slice = ArrayProto.slice,
        concat = ArrayProto.concat,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;

    var
        nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind;

    // ---------------------------------------------
    //          public
    // ---------------------------------------------

    var ly = {};

    // ---------------------------------------------
    //          lang
    // ---------------------------------------------

    ly.identity = function (value) {
        return value;
    };

    ly.has = function (obj, key) {
        return hasOwnProperty.call(obj, key);
    };

    ly.keys = function (obj) {
        if (!ly.isObject(obj)) return [];
        if (nativeKeys) return nativeKeys(obj);
        var keys = [];
        for (var key in obj) if (ly.has(obj, key)) keys.push(key);
        return keys;
    };

    ly.values = function (obj) {
        var keys = ly.keys(obj);
        var length = keys.length;
        var values = new Array(length);
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }
        return values;
    };

    ly.forEach = function (obj, iterator, context) {
        if (obj == null) return obj;
        if (obj.length === +obj.length) {
            for (var i = 0, length = obj.length; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            var keys = ly.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
            }
        }
        return obj;
    };

    ly.map = function (obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        ly.forEach(obj, function (value, index, list) {
            results.push(iterator.call(context, value, index, list));
        });
        return results;
    };

    // ---------------------------------------------
    //          is ...
    // ---------------------------------------------

    ly.isObject = function (obj) {
        return obj === Object(obj);
    };

    ly.isFunction = function (value) {
        return typeof value == 'function';
    };

    ly.isArray = nativeIsArray || function (value) {
        return value && typeof value == 'object' && typeof value.length == 'number' &&
            toString.call(value) == '[object Array]' || false;
    };

    ly.isArguments = function (value) {
        return value && typeof value == 'object' && typeof value.length == 'number' &&
            toString.call(value) == '[object Arguments]' || false;
    };

    ly.isBoolean = function (value) {
        return value === true || value === false ||
            value && typeof value == 'object' && toString.call(value) == '[object Boolean]' || false;
    };

    ly.isString = function (value) {
        return typeof value == 'string' ||
            value && typeof value == 'object' && toString.call(value) == '[object String]' || false;
    };

    ly.isNumber = function (value) {
        return typeof value == 'number' ||
            value && typeof value == 'object' && toString.call(value) == '[object Number]' || false;
    };

    // Is the given value `NaN`? (NaN is the only number which does not equal itself).
    ly.isNaN = function(obj) {
        return ly.isNumber(obj) && obj != +obj;
    };

    ly.isDate = function (value) {
        return value && typeof value == 'object' && toString.call(value) == '[object Date]' || false;
    };

    ly.isUndefined = function (value) {
        return typeof value == 'undefined';
    };

    ly.isRegExp = function (value) {
        return value && typeof value == 'object' && toString.call(value) == '[object RegExp]' || false;
    };

    ly.isEmail = function (value) {
        return ly.isString(value) && _validateEmail(value);
    };

    ly.isHtml = function (text) {
        if(ly.isString(text)){
            text = text.trim();
            return ( text.charAt(0) === "<" && text.charAt(text.length - 1) === ">" && text.length >= 3 );
        }
        return false;
    };

    // ---------------------------------------------
    //          to ...
    // ---------------------------------------------

    ly.toArray = function (obj) {
        if (!obj) return [];
        if (ly.isArray(obj)) return slice.call(obj);
        if (obj.length === +obj.length) return ly.map(obj, ly.identity);
        return ly.values(obj);
    };

    ly.toBoolean = function (value) {
        return !!value ? value != 'false' && value != '0' : false;
    };

    ly.toFloat = function (value, def_value, min, max) {
        var result = parseFloat(value.replace(/,/g, '.'));
        max = parseFloat(max);
        min = parseFloat(min);
        def_value = parseFloat(def_value) || 0.0;
        result = _.isNaN(result) ? def_value : result;
        if (!_.isNaN(max) && result > max) result = max;
        if (!_.isNaN(min) && result < min) result = min;
        return result;
    };

    ly.toInt = function (value, def_value, min, max) {
        var result = parseInt(value);
        max = parseInt(max);
        min = parseInt(min);
        def_value = parseInt(def_value) || 0;
        result = _.isNaN(result) ? def_value : result;
        if (!_.isNaN(max) && result > max) result = max;
        if (!_.isNaN(min) && result < min) result = min;
        return result;
    };

    // ---------------------------------------------
    //          random & GUID
    // ---------------------------------------------

    ly.random = function () {
        try {
            var args = ly.toArray(arguments);
            if (args.length === 1) {
                return Math.random() * args[1];
            } else if (args.length === 2) {
                return Math.floor(Math.random() * args[1]) + args[0];
            }
        } catch (err) {
        }
        return Math.random();
    };

    ly.guid = function () {
        return _s4() + _s4() + '-' + _s4() + '-' + _s4() + '-' +
            _s4() + '-' + _s4() + _s4() + _s4();
    };

    ly.id = function () {
        return _s4() + _s4();
    };

    // ---------------------------------------------
    //          functions
    // ---------------------------------------------

    // Reusable constructor function for prototype setting.
    var ctor = function(){};

    // Create a function bound to a given object (assigning `this`, and arguments,
    // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
    // available.
    ly.bind = function(func, context) {
        var args, bound;
        if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        if (!ly.isFunction(func)) throw new TypeError('Bind must be called on a function');
        args = slice.call(arguments, 2);
        return bound = function() {
            if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
            ctor.prototype = func.prototype;
            var self = new ctor;
            ctor.prototype = null;
            var result = func.apply(self, args.concat(slice.call(arguments)));
            if (Object(result) === result) return result;
            return self;
        };
    };

    // ---------------------------------------------
    //          private
    // ---------------------------------------------

    function _validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function _s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    // ---------------------------------------------
    //          exports
    // ---------------------------------------------

    module.exports = ly;

}());
