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

    var UploadManager = function (options) {
        this.settings = {};
        if (ly.isString(options)) {
            this.settings.root = options;
            this.settings.overwrite = true;
            this.settings.storagepath = path.storagepath; // func
        } else {
            this.settings.root = options['root'];
            this.settings.overwrite = null != options['overwrite'] ? !!options['overwrite'] : true;
            this.settings.storagepath = options['storagepath'] ? options['storagepath'] : path.storagepath; // func or string
        }
    };

    /**
     * Upload a File to upload directory
     * @param options <Form File> with some more attributes:
     *  - overwrite <Boolean>
     *  - storagepath <Boolean>
     * @param callback <Function>. i.e. function(err<String>, file<String>).
     *
     */
    UploadManager.prototype.put = function (options, callback) {
        var self = this;
        var settings = ly.extend(self.settings, options);
        if (!!options && !!options.path && !!options.name) {
            var temp_location = options.path;
            var relative_path = path.join(storagepath(self), ly.replaceAll(' ', '_', options.name));
            var absolute_path = path.join(settings.root, relative_path);
            copyFile(this, temp_location, absolute_path, settings.overwrite, function (err, file) {
                invoke(self, callback, err, relative_path);
            });
        } else {
            invoke(this, callback, '[lyjs-node] UploadManager.put(): Invalid file format: required form file.');
        }
    };

    UploadManager.prototype.remove = function (filePath, callback) {

    };

    UploadManager.prototype.get = function (filePath, callback) {

    };

    // ---------------------------------------------
    //          private
    // ---------------------------------------------

    function copyFile(self, from, to, overwrite, callback) {
        if (!!from && !!to) {
            process.nextTick(function () {
                // creates parent directory if any
                fs.mkdir(path.dirname(to), '0755', true, function (mkdir_err) {
                    if (!mkdir_err) {
                        // ready to copy file
                        fs.stat(to, function (stat_err, stats) {
                            // If the file doesn't exist, create it
                            if ((!!stat_err && stat_err.code === 'ENOENT') || overwrite) {
                                try {
                                    var readFile = fs.createReadStream(from);
                                    var writeFile = fs.createWriteStream(to, { flags: 'w' });
                                    readFile.pipe(writeFile);
                                    readFile.on('end', function () {
                                        invoke(self, callback, null, to);
                                    });
                                } catch (io_err) {
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

    function storagepath(self) {
        var prop = self.settings.storagepath;
        if (ly.isFunction(prop)) {
            return prop();
        } else {
            return prop;
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