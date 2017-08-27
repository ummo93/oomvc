"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
/**
 * Class representing a response entity with all need's information
 * (docs in Response interface).
 *
 * @class
 * @implements {Response}
 */
var ResponseEntity = (function () {
    function ResponseEntity(res) {
        this.headers = {
            'Content-Type': "text/html"
        };
        this.entry = res;
    }
    ResponseEntity.prototype.type = function (contentType) {
        this.headers['Content-Type'] = contentType;
        return this;
    };
    ResponseEntity.prototype.redirect = function (url) {
        this.headers['Location'] = url;
        this.entry.writeHead(302, this.headers);
        this.entry.end('\n');
    };
    ResponseEntity.prototype.send = function (body, status) {
        this.entry.writeHead(status, this.headers);
        this.entry.end(body + "\n");
    };
    ResponseEntity.prototype.sendFile = function (filePath, errCallback) {
        var _this = this;
        var fileMime = {
            ".ico": "image/x-icon",
            ".html": "text/html",
            ".js": "text/javascript",
            ".json": "application/json",
            ".css": "text/css",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".wav": "audio/wav",
            ".mp3": "audio/mpeg",
            ".svg": "image/svg+xml",
            ".pdf": "application/pdf",
            ".doc": "application/msword"
        };
        var ext = path.parse(filePath).ext;
        // maps file extention to MIME typere
        fs.exists(filePath, function (exist) {
            if (!exist) {
                // if the file is not found, return 404
                if (errCallback)
                    errCallback(404);
                else
                    _this.sendStatus(404);
                return;
            }
            // read file from file system
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    if (errCallback)
                        errCallback(500);
                    else
                        _this.sendStatus(500);
                }
                else {
                    // if the file is found, set Content-type and send data
                    _this.entry.setHeader('Content-type', fileMime[ext] || 'text/plain');
                    _this.entry.end(data);
                }
            });
        });
    };
    ResponseEntity.prototype.sendStatus = function (status) {
        this.entry.writeHead(status, this.headers);
        this.entry.end();
    };
    ResponseEntity.prototype.cookie = function (name, value, expire) {
        if (expire) {
            this.headers['Set-Cookie'] = name + "=" + value + "; expires=" + expire;
        }
        else {
            this.headers['Set-Cookie'] = name + "=" + value;
        }
        return this;
    };
    ResponseEntity.prototype.clearCookie = function (name) {
        this.headers['Set-Cookie'] = name + "=; expires=" + new Date(1, 0, 0, 0);
        return this;
    };
    return ResponseEntity;
}());
exports.ResponseEntity = ResponseEntity;
