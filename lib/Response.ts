import { ServerResponse } from "http";
import * as fs from "fs";
import * as path from "path";

/**
 * Interface for classes that include an http response entity.
 *
 * @interface
 */
export interface Response {
    /**
     * @property {ServerResponse} entry - raw response from http.Server
     */
    entry: ServerResponse;
    /**
     * Set the content type of the response.
     * If you don't set content-type, it's been default - text/html
     * @param {string} contentType - for example "text/html"
     *
     * @returns {Response} return self entity
     * @method
     */
    type(contentType: string): Response;
    /**
     * Redirect the client to url
     * @param {string} url - for example "/"
     *
     * @method
     */
    redirect(url: string): void;
    /**
     * Set the response body and finish the response (like res.end() in raw http.Response)
     * @param {string} body - response body string, for example `<h1>Hello world!</h1>`
     * @param {number} status - response status, for example 200, or 404
     *
     * @method
     */
    send(body: string, status: number): void;
    /**
     * Set a clean response body and finish the response with expected status
     * @param {number} status - response status, for example 200, or 404
     *
     * @method
     */
    sendStatus(status: number): void;
    /**
     * Set a cookie
     * @param {string} name - cookie name (key)
     * @param {string} value - cookie value
     * @param {Date} expire - not required parameter. Date where cookies will be clean
     *
     * @returns {Response} self entity
     * @method
     */
    cookie(name: string, value: string, expire?: Date): Response;
    /**
     * Clean the cookie with expected name in next request
     * @param {string} name - cookie name (key)
     *
     * @returns {Response} self entity
     * @method
     */
    clearCookie(name: string): Response;
    /**
     * Send a file in response
     * @param {string} filePath - path to static file
     * @param {Function} errCallback - not required, this is callback if response was corrupted.
     *
     * @returns {Response} self entity
     * @method
     */
    sendFile(filePath: string, errCallback?: Function): void;
}

/**
 * Class representing a response entity with all need's information
 * (docs in Response interface).
 *
 * @class
 * @implements {Response}
 */
export class ResponseEntity implements Response {

    public entry: ServerResponse;
    private headers: any = {
        'Content-Type': "text/html"
    };

    constructor(res: ServerResponse) {
        this.entry = res;
    }

    public type(contentType: string): Response {
        this.headers['Content-Type'] = contentType;
        return this;
    }

    public redirect(url: string): void {
        this.headers['Location'] = url;
        this.entry.writeHead(302, this.headers);
        this.entry.end('\n');
    }

    public send(body: string, status: number): void {
        this.entry.writeHead(status, this.headers);
        this.entry.end(`${body}\n`);
    }

    public sendFile(filePath: string, errCallback?: Function): void {
        let fileMime = {
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
        const ext = path.parse(filePath).ext;
        // maps file extention to MIME typere
        fs.exists(filePath, (exist) => {
            if(!exist) {
                // if the file is not found, return 404
                if(errCallback) errCallback(404);
                else this.sendStatus(404);
                return;
            }
            // read file from file system
            fs.readFile(filePath, (err, data) => {
                if(err){
                    if(errCallback) errCallback(500);
                    else this.sendStatus(500);
                } else {
                    // if the file is found, set Content-type and send data
                    this.entry.setHeader('Content-type', fileMime[ext] || 'text/plain' );
                    this.entry.end(data);
                }
            });
        });
    }

    public sendStatus(status: number): void {
        this.entry.writeHead(status, this.headers);
        this.entry.end();
    }

    public cookie(name: string, value: string, expire?: Date): Response {
        if(expire) {
            this.headers['Set-Cookie'] = `${name}=${value}; expires=${expire}`;
        } else {
            this.headers['Set-Cookie'] = `${name}=${value}`;
        }
        return this;
    }

    public clearCookie(name: string): Response {
        this.headers['Set-Cookie'] = `${name}=; expires=${new Date(1,0,0,0)}`;
        return this;
    }
}