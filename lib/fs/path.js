(function () {

    'use strict';

    // ---------------------------------------------
    //          imports
    // ---------------------------------------------

    var path = require('path');

    // ---------------------------------------------
    //          const
    // ---------------------------------------------

    var SEP = path.sep;
    var DEFAULT_PATH_TEMPLATE = 'y.w'; // output = /YEAR/WEEK/

    // ---------------------------------------------
    //          extends
    // ---------------------------------------------

    /**
     * Returns a path based on current date and time.
     * This is useful when you want avoid too many files uploaded into a single folder.
     * Sample usage:
     * path.storagepath('y.m.d'); // return "/2014/1/21/" (/year/month/day)
     * @param path_template <String> [Optional].
     * Dot separated path template.
     * Supported mode (any combination of):
     * y: year
     * w: week
     * m: month
     * d: day
     * @return {String} i.e. "/2014/18/"
     */
    path.storagepath = function (path_template) {
        path_template = path_template || DEFAULT_PATH_TEMPLATE;
        var map = getDateTokens();
        var tokens = path_template.split('.');
        var result = SEP, i;
        for (i = 0; i < tokens.length; i++) {
            result += (map[tokens[i]] + SEP);
        }
        return result;
    };


    // ---------------------------------------------
    //          private
    // ---------------------------------------------

    function getDateTokens(mode) {
        var now = new Date();
        var month = now.getUTCMonth();
        var day = now.getUTCDate();
        var year = now.getUTCFullYear();
        var onejan = new Date(now.getFullYear(), 0, 1);
        var week = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        return {
            m: month,
            d: day,
            y: year,
            w: week
        }
    }

    // ---------------------------------------------
    //          exports
    // ---------------------------------------------

    module.exports = path;

}).call(this);
