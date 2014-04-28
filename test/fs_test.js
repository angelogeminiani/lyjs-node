'use strict';

var assert = require("assert");
var fs = require('../lib/fs/fs');


describe('Fs', function(){

    describe('#mkdir()', function(){
        var dir_ok = '/tmp/test_dir/one/two/three/four/five/six/seven';
        var dir_err = '/tmp/test_dir_err/one/two/three/four/five/six/seven';

        it('should not return error', function(done){
            fs.mkdir(dir_ok, '0777', true, function (err) {
                if (!!err) {
                    // console.log(err);
                    done(err);
                } else {
                    fs.rmdir('/tmp/test_dir/', true, function(err){
                        if(!!err){
                            done(err);
                        } else {
                            assert.equal(false, fs.existsSync('/tmp/test_dir/'));
                            done();
                        }
                    });
                }
            });
        });

        it('should return error', function(done){
            fs.mkdir(dir_err, '0777', false, function (err) {
                if (err) {
                    done();
                } else {
                    done('This directory should not be created');
                }
            });
        })
    });


    describe('#mkdirSync()', function(){
        var dir_ok2 = '/tmp/test_dir2/one/two/three/four/five/six/seven';

        it('should not return error', function() {
            fs.mkdirSync(dir_ok2, '0777', true);
            fs.rmdirSync('/tmp/test_dir2/', true);
            assert.equal(false, fs.existsSync('/tmp/test_dir2/'));
        });


    });
});