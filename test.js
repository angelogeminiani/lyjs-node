/**
 * SIMPLE DEBUGGABLE TEST.
 */
(function(){
    'use strict';

    // ---------------------------------------------
    //          imports
    // ---------------------------------------------

    var fs = require('./lib/fs/fs');
    var dir_ok = '/tmp/test_dir/one/two/three/four/five/six/seven';

    // ---------------------------------------------
    //          public
    // ---------------------------------------------

    fs.mkdir(dir_ok, '0777', true, function (err) {
        if (!!err) {
            console.log(err);
        } else {
            fs.rmdir('/tmp/test_dir/', true, function(err){
                if(!!err){
                    console.log(err);
                } else {

                }
            });
        }
    });

})();

