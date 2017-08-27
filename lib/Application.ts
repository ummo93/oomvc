import { IncomingMessage, Server, ServerResponse } from "http";
import { Response, ResponseEntity } from "./Response";
import { Request, RequestEntity } from "./Request";
import { Controller } from './Controller';
import http = require("http");
import path = require('path');
import fs = require('fs');

/**
 * Enum for http request methods.
 * @enum {number}
 * @readonly
 */
export enum Method {
    GET, POST, PUT, DELETE
}

/**
 * Abstract class of the application.
 * Extend your Main class with this abstract class to takes all methods of the application.
 * If you want to customise path for static files or port number, you may define this fields (example).
 * Example:
 *
 * class MainServer extends Application {
 *
 *     public port = process.env.PORT || 5000;
 *     public staticPath = "./public";
 *     public controllers = [
 *         mainCtrl
 *     ];
 *
 *     public start(instance: Server) {
 *         instance.listen(this.port, () => {
 *             console.log('%d Server start at port ' + this.port, process.pid);
 *         });
 *     }
 * }
 * export default new MainServer().init();
 * @class
 * @abstract
 * */
export abstract class Application {
    /**
     * @property {number|string} port - application port
     * @abstract
     */
    protected abstract port;
    /**
     * @property {Array<Controller>} controllers - controller list
     * @abstract
     */
    protected abstract controllers: Array<Controller>;
    /**
     * @property {string} staticPath - Path for static files
     */
    protected staticPath: string = "./public";
    /**
     * @property {Server} app - Raw server instance
     */
	private app: Server;
    /**
     * @property {Object} app - Mime types for downloaded files
     */
    protected fileMime = {
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

    /**
     * Searching and launch necessary Controller and his method for client request url
     * @param req {Request}  Instance of RequestEntity
     * @param res {Response}  Instance of ResponseEntity
     * @return {void}
     */
    private parseRequest(req: Request, res: Response): void {
        try {
            let paramsMap = new Map(); // url parameters from request string
            let pathName = Controller.mappedHandlers[Method[req.method]][req.url.pathname];
            let methodName = '';
            if(!pathName) {
                // or 404, or requested url contain's req param
                for(let url in Controller.mappedHandlers[Method[req.method]]) {
                    if(/:/g.test(url)) {
                        let splitURL = url.split("/");
                        let splitReqURL = req.url.pathname.split("/");
                        for(let i = 0; i < splitURL.length; i++) {
                            if(/:/g.test(splitURL[i])) {
                                if(splitReqURL[i]) {
                                    paramsMap.set(splitURL[i].replace(":", ""), splitReqURL[i]);
                                    splitURL[i] = splitReqURL[i];
                                }
                            }
                        }
                        let newURL = splitURL.join("/");
                        if(newURL == req.url.pathname) {
                            methodName = Controller.mappedHandlers[Method[req.method]][url].method;
                            pathName = Controller.mappedHandlers[Method[req.method]][url];
                            break;
                        }
                    }
                }
            } else {
                methodName = pathName.method;
            }
            // method's class
            let className = pathName.className;
            if (methodName && className) {
                for (let i = 0; i < this.controllers.length; i++) {
                    let protoName = this.controllers[i]['__proto__'].constructor.name;
                    if (protoName == className) {
                        req.params = paramsMap;
                        this.controllers[i][methodName](req, res);
                        return;
                    }
                }
            }
        } catch (e) {
            // path error, or static file
            this.sendFile(req.url.pathname, res);
        }
    }

    /**
     * Sending the static file or return an exception (404 or 500) if file is not found
     * @param pathName {string}  File path, which extracting from request
     * @param res {Response}  Instance of ResponseEntity
     * @return {void}
     */
    private sendFile(pathName: string, res: Response): void {
        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = path.parse(pathName).ext;
        // maps file extention to MIME typere
        fs.exists(this.staticPath + pathName, (exist) => {
            if(!exist) {
                // if the file is not found, return 404
                this.except(pathName, res, 404);
                return;
            }
            // read file from file system
            fs.readFile(this.staticPath + pathName, (err, data) => {
                if(err){
                    this.except(pathName, res, 500);
                } else {
                    // if the file is found, set Content-type and send data
                    res.entry.setHeader('Content-type', this.fileMime[ext] || 'text/plain' );
                    res.entry.end(data);
                }
            });
        });
    }

    /**
     * Return an exception if file is not found
     * @param pathName {string}  File path, which extracting from request
     * @param res {Response}  Instance of ResponseEntity
     * @param code {number}  response code
     * @return {void}
     */
    private except(pathName: string, res: Response, code: number): void {
        switch(code) {
            case(404):
                res.entry.writeHead(404, {"Content-Type": "text/html"});
                res.entry.end(`<h1>404 Not Found</h1><p>Endpont for url "${pathName}" not found</p>`);
                break;
            case(500):
                res.entry.writeHead(500, {"Content-Type": "text/html"});
                res.entry.end(`<h1>500 Internal Server Error</h1><p>Error getting the file "${pathName}"</p>`);
                break;
        }
        console.error(`${pathName} | Not found`);
    }

    /**
     * Starting the http web server
     * @return {void}
     */
    public init() {
        this.app = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            if(Method[req.method] != Method.GET) {
                let postData = "";
                req.on("data", (buff: Buffer) => {
                    postData = buff.toString("utf-8");
                });
                req.on("end", () => {
                    this.parseRequest(new RequestEntity(req, "http", postData), new ResponseEntity(res));
                });
            } else {
                this.parseRequest(new RequestEntity(req, "http"), new ResponseEntity(res));
            }
        });
        this.start(this.app);
        return this;
    }

    /**
     * Define what's happened after server was started
     * @param instance {Server}  Instance of pure http server
     * @abstract
     * @return {void}
     */
    protected abstract start(instance: Server): void;
}