"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Application_1 = require("./Application");
const Handlebars = require("handlebars");
const fs = require("fs");
/**
 * Controller
 * Extend your controller class with this class to takes all methods of the controllers, such as view rendering, etc.
 * If you want to customise path for view files you may define this fields (example).
 * To make the controller work, you must import his in your server's class's field "controllers".
 * Example:
 *
 * class MainCtrl extends Controller {
 *
 *     public viewPath = "./src/views/"; // Redefining view path. Defaults = "./src/views/"
 *
 *     @Controller.get("/hello/:name")
 *     private getUser(req: Request, res: Response) {
 *         res.send(`Hello ${req.params.get("name")}!`, 200);
 *     }
 * }
 * export default new MainCtrl();
 * @class
 * */
class Controller {
    constructor() {
        /**
         * @property {string} viewPath - define path for views files
         */
        this.viewPath = "./src/views/";
        /**
         * @property {string} partialsPath - define path for handlebars partials directory
         */
        this.partialsPath = "./src/views/";
    }
    // We need to register all files from partials folder
    init() {
        // Instance of this class will not created dynamically, so we can use Sync methods;
        const partials = fs.readdirSync(this.partialsPath);
        for (let i = 0; i < partials.length; i++) {
            try {
                let content = fs.readFileSync(this.partialsPath + partials[i], 'utf8');
                Handlebars.registerPartial(partials[i].split(".")[0], content);
            }
            catch (e) { }
        }
        return this;
    }
    /**
     * Set handler to handle GET requests
     * Example:
     *
     * @Controller.get("/hello/:name") // set handler as 'GET handler'
     * private getUser(req: Request, res: Response) { // handler
     *    res.send(`Hello ${req.params.get("name")}!`, 200);
     * }
     * @param path {string}  url for handler
     * @return {Function}
     */
    static get(path) {
        return (target, propertyKey, descriptor) => {
            // Give information about handler's url to handler entity
            descriptor.value.url = path;
            // Add name of the method in handler's list
            target.constructor.mappedHandlers[Application_1.Method.GET][path] = {
                method: propertyKey,
                className: target.constructor.name
            };
        };
    }
    ;
    /**
     * Set handler to handle POST requests
     * Example:
     *
     * @Controller.post("/") // set handler as 'POST handler'
     * private postUser(req: Request, res: Response) { // handler
     *    res.send(`User with name ${req.body.toJSON().name} was created!`, 200);
     * }
     * @param path {string}  url for handler
     * @return {Function}
     */
    static post(path) {
        return (target, propertyKey, descriptor) => {
            descriptor.value.url = path;
            target.constructor.mappedHandlers[Application_1.Method.POST][path] = {
                method: propertyKey,
                className: target.constructor.name
            };
        };
    }
    ;
    /**
     * Set handler to handle PUT requests
     * Example:
     *
     * @Controller.put("/") // set handler as 'PUT handler'
     * private postUser(req: Request, res: Response) { // handler
     *    res.send(`User with name ${req.body.toJSON().name} was created!`, 200);
     * }
     * @param path {string}  url for handler
     * @return {Function}
     */
    static put(path) {
        return (target, propertyKey, descriptor) => {
            descriptor.value.url = path;
            target.constructor.mappedHandlers[Application_1.Method.PUT][path] = {
                method: propertyKey,
                className: target.constructor.name
            };
        };
    }
    ;
    /**
     * Set handler to handle DELETE requests
     * Example:
     *
     * @Controller.delete("/") // set handler as 'DELETE handler'
     * private postUser(req: Request, res: Response) { // handler
     *    res.send(`User with name ${req.body.toJSON().name} was deleted!`, 200);
     * }
     * @param path {string}  url for handler
     * @return {Function}
     */
    static delete(path) {
        return (target, propertyKey, descriptor) => {
            descriptor.value.url = path;
            target.constructor.mappedHandlers[Application_1.Method.DELETE][path] = {
                method: propertyKey,
                className: target.constructor.name
            };
        };
    }
    ;
    /**
     * Render the view from views folder
     * Example:
     *
     * @Controller.get("/") // set handler as 'GET handler'
     * private getMainPage(req: Request, res: Response) {
     *    let data = { name: "Alex", age: 25 }
     *    this.render("index", data).then(template => {
     *        res.send(template, 200);
     *    }).catch(error => {
     *        res.send(error, 404);
     *    });
     * }
     * @param templateName {string}  name of the view file
     * @param data  data object for rendering
     * @return {Function}
     */
    render(templateName, data) {
        return new Promise((resolve, reject) => {
            fs.readFile(this.viewPath + templateName + ".hbs", 'utf8', (error, innerText) => {
                if (error) {
                    reject(error.message);
                }
                else {
                    let template = Handlebars.compile(innerText);
                    resolve(template(data));
                }
            });
        });
    }
}
/**
 * @property {Object} mappedHandlers - mappings: 0 - GET, 1 - POST, 2 - PUT, 3 - DELETE
 * @static
 */
Controller.mappedHandlers = { 0: {}, 1: {}, 2: {}, 3: {} };
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map