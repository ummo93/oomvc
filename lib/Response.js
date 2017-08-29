"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
/**
 * Class representing a response entity with all need's information
 * (docs in Response interface).
 *
 * @class
 * @implements {Response}
 */
class ResponseEntity {
    constructor(res) {
        this.headers = {
            'Content-Type': "text/html"
        };
        this.entry = res;
    }
    type(contentType) {
        this.headers['Content-Type'] = contentType;
        return this;
    }
    redirect(url) {
        this.headers['Location'] = url;
        this.entry.writeHead(302, this.headers);
        this.entry.end('\n');
    }
    send(body, status) {
        let cookies = "";
        if (this.headers['Set-Cookie']) {
            this.headers['Set-Cookie'].forEach((item, i) => {
                cookies += `Set-Cookie: ${item}\n`;
            });
        }
        this.entry.writeHead(status, this.headers);
        this.entry.end(`${body}\n`);
    }
    sendFile(filePath, errCallback) {
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
            if (!exist) {
                // if the file is not found, return 404
                if (errCallback)
                    errCallback(404);
                else
                    this.sendStatus(404);
                return;
            }
            // read file from file system
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    if (errCallback)
                        errCallback(500);
                    else
                        this.sendStatus(500);
                }
                else {
                    // if the file is found, set Content-type and send data
                    this.entry.setHeader('Content-type', fileMime[ext] || 'text/plain');
                    this.entry.end(data);
                }
            });
        });
    }
    sendStatus(status) {
        this.entry.writeHead(status, this.headers);
        this.entry.end();
    }
    cookie(name, value, expire) {
        if (!this.headers['Set-Cookie'])
            this.headers['Set-Cookie'] = [];
        if (expire) {
            this.headers['Set-Cookie'].push(`${name}=${value}; expires=${expire}`);
        }
        else {
            this.headers['Set-Cookie'].push(`${name}=${value}`);
        }
        return this;
    }
    clearCookie(name) {
        this.headers['Set-Cookie'] = `${name}=; expires=${new Date(1, 0, 0, 0)}`;
        return this;
    }
}
exports.ResponseEntity = ResponseEntity;
//# sourceMappingURL=Response.js.map