/**
 * Manage File Upload.
 * UploadManager is created with an "uploadDir" parameter that's the upload folder.
 * Once created, an UploadManager exposes three methods:
 * put: Upload a File
 * remove: Remove a File
 * get: Return File
 *
 */
(function () {

    'use strict';

    // ---------------------------------------------
    //          imports
    // ---------------------------------------------

    var ly = require('../ly');
    var fs = require('./fs');
    var path = require('./path');

    // ---------------------------------------------
    //          public
    // ---------------------------------------------

    var UploadManager = function (uploadDir) {
        this.root = uploadDir;

    };

    /**
     * Upload a File to upload directory
     * @param fileForm <Form File>
     * @param callback <Function>. i.e. function(err, file)
     */
    UploadManager.prototype.put = function (fileForm, callback) {
        var self = this;
        if (!!fileForm && !!fileForm.path && !!fileForm.name) {
            var temp_location = fileForm.path;
            var destination_path = path.join(self.root, path.storagepath(), fileForm.name);
            copyFile(this, temp_location, destination_path, callback);
        } else {
            invoke(this, callback, 'Invalid file format: required form file.');
        }
    };

    UploadManager.prototype.remove = function (filePath, callback) {

    };

    UploadManager.prototype.get = function (filePath, callback) {

    };

    // ---------------------------------------------
    //          private
    // ---------------------------------------------

    function copyFile(self, from, to, callback) {
        if (!!from && !!to) {
            process.nextTick(function(){
                // creates parent directory if any
                fs.mkdir(path.dirname(to), '0755', true, function (mkdir_err) {
                    if (!mkdir_err) {
                        // ready to copy file
                        fs.stat(to, function (stat_err, stats) {
                            // If the file doesn't exist, create it
                            if (stat_err && stat_err.code === 'ENOENT') {
                                try{
                                    var readFile = fs.createReadStream(from);
                                    var writeFile = fs.createWriteStream(to, { flags: 'w' });
                                    readFile.pipe(writeFile);
                                    readFile.on('end', function () {
                                        invoke(self, callback, null, to);
                                    });
                                } catch(io_err){
                                    invoke(self, callback, io_err);
                                }
                            } else if (stats && stats.isFile()) {
                                // If the file does exist, just pass back the file details
                                invoke(self, callback, null, to);
                            } else {
                                // If there was an error that wasn't a non-existent file, return it
                                invoke(self, callback, stat_err);
                            }
                        })
                    } else {
                        // something wrong during path creation
                        invoke(self, callback, mkdir_err);
                    }
                });
            });
        } else {
            // (paranoia check) this should never happen
            invoke(self, callback, 'Missing "from" or "to" parameter. Unable to continue.');
        }
    }

    function invoke(self, callback, err, data) {
        if (ly.isFunction(callback)) {
            callback.apply(self, [err, data]);
        }
    }

    // ---------------------------------------------
    //          static
    // ---------------------------------------------

    UploadManager.build = function (uploadDir) {
        return new UploadManager(uploadDir);
    };

    // ---------------------------------------------
    //          exports
    // ---------------------------------------------

    module.exports = UploadManager;

}());