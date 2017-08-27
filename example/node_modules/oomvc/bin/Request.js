"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
const querystring = require("querystring");
/**
 * Class representing a request body with all need's information.
 *
 * @class
 * @implements {RequestBody}
 */
class RequestBodyEntity {
    constructor(text) {
        this.text = text;
    }
    toJSON() {
        try {
            return JSON.parse(this.text);
        }
        catch (e) {
            return querystring.parse(this.text);
        }
    }
}
exports.RequestBodyEntity = RequestBodyEntity;
/**
 * Class representing a client request with all need's information.
 *
 * @class
 * @implements {Request}
 */
class RequestEntity {
    constructor(req, protocol, postData) {
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
    accepts(type) {
        //"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
        if (this.headers.accept) {
            let accepts = this.headers.accept.split(";")[0].split(",");
            if (typeof type == 'string') {
                let isAccepts = accepts.indexOf(type);
                if (isAccepts != -1)
                    return accepts[isAccepts];
                else
                    return undefined;
            }
            else {
                for (let i = 0; i < type.length; i++) {
                    let isAccepts = accepts.indexOf(type[i]);
                    if (isAccepts != -1)
                        return accepts[isAccepts];
                }
                return undefined;
            }
        }
        else {
            return undefined;
        }
    }
}
exports.RequestEntity = RequestEntity;
//# sourceMappingURL=Request.js.map