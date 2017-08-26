"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Response_1 = require("./Response");
var Request_1 = require("./Request");
var Controller_1 = require("./Controller");
var http = require("http");
var path = require("path");
var fs = require("fs");
/**
 * Enum for http request methods.
 * @enum {number}
 * @readonly
 */
var Method;
(function (Method) {
    Method[Method["GET"] = 0] = "GET";
    Method[Method["POST"] = 1] = "POST";
    Method[Method["PUT"] = 2] = "PUT";
    Method[Method["DELETE"] = 3] = "DELETE";
})(Method = exports.Method || (exports.Method = {}));
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
var Application = (function () {
    function Application() {
        /**
         * @property {string} staticPath - Path for static files
         */
        this.staticPath = "./public";
        /**
         * @property {Object} app - Mime types for downloaded files
         */
        this.fileMime = {
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
    }
    /**
     * Searching and launch necessary Controller and his method for client request url
     * @param req {Request}  Instance of RequestEntity
     * @param res {Response}  Instance of ResponseEntity
     * @return {void}
     */
    Application.prototype.parseRequest = function (req, res) {
        try {
            var paramsMap = new Map(); // url parameters from request string
            var pathName = Controller_1.Controller.mappedHandlers[Method[req.method]][req.url.pathname];
            var methodName = '';
            if (!pathName) {
                // or 404, or requested url contain's req param
                for (var url in Controller_1.Controller.mappedHandlers[Method[req.method]]) {
                    if (/:/g.test(url)) {
                        var splitURL = url.split("/");
                        var splitReqURL = req.url.pathname.split("/");
                        for (var i = 0; i < splitURL.length; i++) {
                            if (/:/g.test(splitURL[i])) {
                                if (splitReqURL[i]) {
                                    paramsMap.set(splitURL[i].replace(":", ""), splitReqURL[i]);
                                    splitURL[i] = splitReqURL[i];
                                }
                            }
                        }
                        var newURL = splitURL.join("/");
                        if (newURL == req.url.pathname) {
                            methodName = Controller_1.Controller.mappedHandlers[Method[req.method]][url].method;
                            pathName = Controller_1.Controller.mappedHandlers[Method[req.method]][url];
                            break;
                        }
                    }
                }
                5;
            }
            else {
                methodName = pathName.method;
            }
            // method's class
            var className = pathName.className;
            if (methodName && className) {
                for (var i = 0; i < this.controllers.length; i++) {
                    var protoName = this.controllers[i]['__proto__'].constructor.name;
                    if (protoName == className) {
                        req.params = paramsMap;
                        this.controllers[i][methodName](req, res);
                        return;
                    }
                }
            }
        }
        catch (e) {
            // path error, or static file
            this.sendFile(req.url.pathname, res);
        }
    };
    /**
     * Sending the static file or return an exception (404 or 500) if file is not found
     * @param pathName {string}  File path, which extracting from request
     * @param res {Response}  Instance of ResponseEntity
     * @return {void}
     */
    Application.prototype.sendFile = function (pathName, res) {
        var _this = this;
        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        var ext = path.parse(pathName).ext;
        // maps file extention to MIME typere
        fs.exists(this.staticPath + pathName, function (exist) {
            if (!exist) {
                // if the file is not found, return 404
                _this.except(pathName, res, 404);
                return;
            }
            // read file from file system
            fs.readFile(_this.staticPath + pathName, function (err, data) {
                if (err) {
                    _this.except(pathName, res, 500);
                }
                else {
                    // if the file is found, set Content-type and send data
                    res.entry.setHeader('Content-type', _this.fileMime[ext] || 'text/plain');
                    res.entry.end(data);
                }
            });
        });
    };
    /**
     * Return an exception if file is not found
     * @param pathName {string}  File path, which extracting from request
     * @param res {Response}  Instance of ResponseEntity
     * @param code {number}  response code
     * @return {void}
     */
    Application.prototype.except = function (pathName, res, code) {
        switch (code) {
            case (404):
                res.entry.writeHead(404, { "Content-Type": "text/html" });
                res.entry.end("<h1>404 Not Found</h1><p>Endpont for url \"" + pathName + "\" not found</p>");
                break;
            case (500):
                res.entry.writeHead(500, { "Content-Type": "text/html" });
                res.entry.end("<h1>500 Internal Server Error</h1><p>Error getting the file \"" + pathName + "\"</p>");
                break;
        }
        console.error(pathName + " | Not found");
    };
    /**
     * Starting the http web server
     * @return {void}
     */
    Application.prototype.init = function () {
        var _this = this;
        this.app = http.createServer(function (req, res) {
            if (Method[req.method] != Method.GET) {
                var postData_1 = "";
                req.on("data", function (buff) {
                    postData_1 = buff.toString("utf-8");
                });
                req.on("end", function () {
                    _this.parseRequest(new Request_1.RequestEntity(req, "http", postData_1), new Response_1.ResponseEntity(res));
                });
            }
            else {
                _this.parseRequest(new Request_1.RequestEntity(req, "http"), new Response_1.ResponseEntity(res));
            }
        });
        this.start(this.app);
        return this;
    };
    return Application;
}());
exports.Application = Application;
