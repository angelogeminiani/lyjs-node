(function () {

    'use strict';

    // ---------------------------------------------
    //          imports
    // ---------------------------------------------

    var ly = require('../ly');

    // ---------------------------------------------
    //          public
    // ---------------------------------------------

    function FormUtils() {

    }

    /**
     * Return an object containing all form parameters (String, Number, Boolean)
     * @param req
     * @return {{}}
     */
    FormUtils.prototype.params = function (req) {
        var result = {};
        if (ly.isObject(req['query'])) {
            result = extendWithParams(result, req['query']);
        }
        if (ly.isObject(req['params'])) {
            result = extendWithParams(result, req['params']);
        }
        if (ly.isObject(req['body'])) {
            result = extendWithParams(result, req['body']);
        }
        return result;
    };

    // ---------------------------------------------
    //          private
    // ---------------------------------------------

    function extendWithParams(obj) {
        ly.forEach(Array.prototype.slice.call(arguments, 1), function (source) {
            for (var prop in source) {
                if(source.hasOwnProperty(prop)
                    && (ly.isString(source[prop])||ly.isBoolean(source[prop])||ly.isNumber(source[prop]))){
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    }

    // ---------------------------------------------
    //          exports
    // ---------------------------------------------

    module.exports = new FormUtils();

}).call(this);