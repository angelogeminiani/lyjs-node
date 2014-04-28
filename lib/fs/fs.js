/**
 * fs.mkdir is based on original code of Bruno Pedro: https://github.com/bpedro/node-fs
 *
 *
 */
(function () {

    'use strict';

    // ---------------------------------------------
    //          imports
    // ---------------------------------------------

    var fs = require('fs'),
        mkdirOrig = fs.mkdir,
        mkdirSyncOrig = fs.mkdirSync,
        rmdirOrig = fs.rmdir,
        rmdirSyncOrig = fs.rmdirSync;
    var path = require('path');

    // ---------------------------------------------
    //          const
    // ---------------------------------------------

    var dir_sep = process.platform === 'win32' ? '\\' : '/';


    // ---------------------------------------------
    //          public
    // ---------------------------------------------

    /**
     * Polymorphic approach to fs.mkdir()
     *
     * If the third parameter is boolean and true assume that
     * caller wants recursive operation.
     */
    fs.mkdir = function (path, mode, recursive, callback) {
        if (typeof recursive !== 'boolean') {
            callback = recursive;
            recursive = false;
        }

        if (typeof callback !== 'function') {
            callback = function () {
            };
        }

        if (!recursive) {
            mkdirOrig(path, mode, callback);
        } else {
            mkdir_p(path, mode, callback);
        }
    };

    /**
     * Polymorphic approach to fs.mkdirSync()
     *
     * If the third parameter is boolean and true assume that
     * caller wants recursive operation.
     */
    fs.mkdirSync = function (path, mode, recursive) {
        if (typeof recursive !== 'boolean') {
            recursive = false;
        }

        if (!recursive) {
            mkdirSyncOrig(path, mode);
        } else {
            mkdirSync_p(path, mode);
        }
    };

    fs.rmdir = function (path, recursive, callback) {
        if (typeof recursive !== 'boolean') {
            callback = recursive;
            recursive = false;
        }

        if (typeof callback !== 'function') {
            callback = function () {
            };
        }

        if (!recursive) {
            rmdirOrig(path, callback);
        } else {
            rmdir_r(path, callback);
        }
    };

    fs.rmdirSync = function (path, recursive) {
        if (typeof recursive !== 'boolean') {
            recursive = false;
        }

        if (!recursive) {
            rmdirSyncOrig(path);
        } else {
            rmdirSync_r(path);
        }
    };

    // ---------------------------------------------
    //          private
    // ---------------------------------------------

    /**
     * Offers functionality similar to mkdir -p
     *
     * Asynchronous operation. No arguments other than a possible exception
     * are given to the completion callback.
     */
    function mkdir_p(full_path, mode, callback, position) {
        var parts = path.normalize(full_path).split(dir_sep);

        mode = mode || process.umask();
        position = position || 0;

        if (position >= parts.length) {
            return callback();
        }

        var directory = parts.slice(0, position + 1).join(dir_sep) || dir_sep;
        fs.stat(directory, function (err) {
            if (err === null) {
                mkdir_p(full_path, mode, callback, position + 1);
            } else {
                mkdirOrig(directory, mode, function (err) {
                    if (err && err.code != 'EEXIST') {
                        return callback(err);
                    } else {
                        mkdir_p(full_path, mode, callback, position + 1);
                    }
                });
            }
        });
    }

    function mkdirSync_p(full_path, mode, position) {
        var parts = path.normalize(full_path).split(dir_sep);

        mode = mode || process.umask();
        position = position || 0;

        if (position >= parts.length) {
            return true;
        }

        var directory = parts.slice(0, position + 1).join(dir_sep) || dir_sep;
        try {
            fs.statSync(directory);
            mkdirSync_p(full_path, mode, position + 1);
        } catch (e) {
            try {
                mkdirSyncOrig(directory, mode);
                mkdirSync_p(full_path, mode, position + 1);
            } catch (e) {
                if (e.code != 'EEXIST') {
                    throw e;
                }
                mkdirSync_p(full_path, mode, position + 1);
            }
        }
    }

    function rmdir_r(path, callback) {
        fs.stat(path, function (err, stats) {
            if (err) {
                callback(err, stats);
                return;
            }
            if (stats.isFile()) {
                fs.unlink(path, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, true);
                    }
                    return;
                });
            } else if (stats.isDirectory()) {
                // A folder may contain files
                // We need to delete the files first
                // When all are deleted we could delete the
                // dir itself
                fs.readdir(path, function (err, files) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    var f_length = files.length;
                    var f_delete_index = 0;

                    // Check and keep track of deleted files
                    // Delete the folder itself when the files are deleted

                    var checkStatus = function () {
                        // We check the status
                        // and count till we r done
                        if (f_length === f_delete_index) {
                            rmdirOrig(path, function (err) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, true);
                                }
                            });
                            return true;
                        }
                        return false;
                    };
                    if (!checkStatus()) {
                        for (var i = 0; i < f_length; i++) {
                            // Create a local scope for filePath
                            // Not really needed, but just good practice
                            // (as strings aren't passed by reference)
                            (function () {
                                var filePath = path + '/' + files[i];
                                // Add a named function as callback
                                // just to enlighten debugging
                                rmdir_r(filePath, function removeRecursiveCB(err, status) {
                                    if (!err) {
                                        f_delete_index++;
                                        checkStatus();
                                    } else {
                                        callback(err, null);
                                        return;
                                    }
                                });

                            })()
                        }
                    }
                });
            }
        });
    }

    function rmdirSync_r(full_path) {
        var files = [];
        if (fs.existsSync(full_path)) {
            files = fs.readdirSync(full_path);
            files.forEach(function (file, index) {
                var curPath = full_path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    // recurse
                    rmdirSync_r(curPath);
                } else {
                    // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(full_path);
        }
    }

    // ---------------------------------------------
    //          exports
    // ---------------------------------------------

    module.exports = fs;

}());