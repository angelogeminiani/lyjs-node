(function(){

    'use strict';

    // ---------------------------------------------
    //          exports
    // ---------------------------------------------

    //-- utility --//
    module.exports.ly = require('./lib/ly');

    //-- base classes (extend from this if you want those features) --//
    module.exports.Invoker = require('./lib/base/invoker');
    module.exports.Events = require('./lib/base/events');
    module.exports.Template = require('./lib/base/template');

    //-- File System --//
    module.exports.path = require('./lib/fs/path');
    module.exports.fs = require('./lib/fs/fs');
    module.exports.UploadManager = require('./lib/fs/upload-manager');

    //-- Forms --//
    module.exports.forms = require('./lib/form/form-utils');

})();