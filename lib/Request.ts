import { IncomingMessage } from "http";
import url = require('url');
import * as querystring from "querystring";

/**
 * Interface for classes that represent http request.
 *
 * @interface
 */
export interface Request {
    /**
     * @property {IncomingMessage} entry - raw request from http.Server
     */
    entry: IncomingMessage;
    /**
     * @property {RequestBody} body - request body, that was parsed from POST, PUT or DELETE request
     */
    body: RequestBody;
    /**
     * @property {url.Url} url - request url with raw query and search params
     */
    url: url.Url;
    /**
     * @property {Object} headers - request headers
     */
    headers: any;
    /**
     * @property {Object} cookies - request cookies
     */
    cookies: any;
    /**
     * @property {Object} query - request query, for example:
     * string "/?name=Alex" from url is {"name": "Alex"} in this field (Request.query)
     */
    query: any;
    /**
     * @property {string} method - request method, "GET" for example
     */
    method: string;
    /**
     * @property {string} protocol - server protocol, "http" for example
     */
    protocol: string;
    /**
     * @property {Map<string, string>} params - url parameters for example, if you create endpoint with url:
     * "/user/:id/" and client request url will be "/user/123135", you takes a Map with parameter id=123135.
     * You can get this parameter: let id = req.params.get("id"); // 123135
     */
    params: Map<string, string>;
    /**
     * Get the Accept header from input list.
     * @param {string|Array<string} type - expected accept header, for example ['application/json', 'text/html']
     *
     * @returns {string|undefined} Accept string, for example "text/html"
     * @method
     */
    accepts(type: string|Array<string>): string|undefined
}

/**
 * Interface for Request.body field.
 *
 * @interface
 */
export interface RequestBody {
    /**
     * @property {string} text - raw request body
     */
    text: string;
    /**
     * Get JSON representation of request body despite the request body's content-type
     * @returns {Object} JSON representation
     * @method
     */
    toJSON();
}

/**
 * Class representing a request body with all need's information.
 *
 * @class
 * @implements {RequestBody}
 */
export class RequestBodyEntity implements RequestBody {

    public text: string;

    constructor(text: string) {
        this.text = text;
    }

    public toJSON() {
        try {
            return JSON.parse(this.text);
        } catch(e) {
            return querystring.parse(this.text);
        }

    }
}

/**
 * Class representing a client request with all need's information.
 *
 * @class
 * @implements {Request}
 */
export class RequestEntity implements Request {

    public entry: IncomingMessage;
    public url: url.Url;
    public method: string;
    public protocol: string;
    public headers: any;
    public cookies: any;
    public body: RequestBody;
    public query: any;
    public params: Map<string, string>;

    constructor(req: IncomingMessage, protocol: string, postData?) {
        this.params = new Map();
        this.protocol = protocol;
        this.entry = req;
        this.url = url.parse(req.url);
        this.query = querystring.parse(this.url.query);
        this.method = req.method;
        this.headers = req.headers;
        this.cookies = querystring.parse(req.headers.cookie);
        if(postData) this.body = new RequestBodyEntity(postData);
    }

    public accepts(type: string|Array<string>): string|undefined {
        //"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
        if(this.headers.accept) {
            let accepts = this.headers.accept.split(";")[0].split(",");
            if(typeof type == 'string') {
                let isAccepts = accepts.indexOf(type);
                if(isAccepts != -1) return accepts[isAccepts];
                else return undefined;
            } else {
                for(let i = 0; i < type.length; i++) {
                    let isAccepts = accepts.indexOf(type[i]);
                    if(isAccepts != -1) return accepts[isAccepts];
                }
                return undefined;
            }
        } else {
            return undefined;
        }
    }
}