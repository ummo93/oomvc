"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("url");
var querystring = require("querystring");
/**
 * Class representing a request body with all need's information.
 *
 * @class
 * @implements {RequestBody}
 */
var RequestBodyEntity = (function () {
    function RequestBodyEntity(text) {
        this.text = text;
    }
    RequestBodyEntity.prototype.toJSON = function () {
        try {
            return JSON.parse(this.text);
        }
        catch (e) {
            return querystring.parse(this.text);
        }
    };
    return RequestBodyEntity;
}());
exports.RequestBodyEntity = RequestBodyEntity;
/**
 * Class representing a client request with all need's information.
 *
 * @class
 * @implements {Request}
 */
var RequestEntity = (function () {
    function RequestEntity(req, protocol, postData) {
        this.params = new Map();
        this.protocol = protocol;
        this.entry = req;
        this.url = url.parse(req.url);
        this.query = querystring.parse(this.url.query);
        this.method = req.method;
        this.headers = req.headers;
        this.cookies = querystring.parse(req.headers.cookie);
        if (postData)
            this.body = new RequestBodyEntity(postData);
    }
    RequestEntity.prototype.accepts = function (type) {
        //"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
        if (this.headers.accept) {
            var accepts = this.headers.accept.split(";")[0].split(",");
            if (typeof type == 'string') {
                var isAccepts = accepts.indexOf(type);
                if (isAccepts != -1)
                    return accepts[isAccepts];
                else
                    return undefined;
            }
            else {
                for (var i = 0; i < type.length; i++) {
                    var isAccepts = accepts.indexOf(type[i]);
                    if (isAccepts != -1)
                        return accepts[isAccepts];
                }
                return undefined;
            }
        }
        else {
            return undefined;
        }
    };
    return RequestEntity;
}());
exports.RequestEntity = RequestEntity;
