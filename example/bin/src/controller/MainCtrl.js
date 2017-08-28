"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const oomvc_1 = require("oomvc");
const User_1 = require("../model/User");
class MainCtrl extends oomvc_1.Controller {
    constructor() {
        super(...arguments);
        this.viewPath = "./src/views/"; // Redefining view path. Defaults = "./src/views/"
        this.partialsPath = "./src/views/inc/"; // Redefine path to handlebars partials. Defaults = "./src/views/"
    }
    getMainPage(req, res) {
        let data = {
            "name": "Alan",
            "cook": req.cookies["DimaTest"],
            "hometown": "Somewhere, TX",
            "kids": [
                { "name": "Jimmy", "age": "14" },
                { "name": "Sally", "age": "10" }
            ]
        };
        res.cookie("DimaTest", "12356");
        this.render("index", data).then(template => {
            res.send(template, 200);
        }).catch(error => {
            res.send(error, 404);
        });
    }
    newUser(req, res) {
        const user = new User_1.User({ name: req.body.toJSON().name, birthday: new Date() });
        user.post().then(() => {
            res.type("application/json").send(JSON.stringify(user.get()), 200);
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = yield User_1.User.findOne({ where: { name: req.params.get("name") } });
                res.type("application/json").send(JSON.stringify(user.get()), 200);
            }
            catch (e) {
                res.type("application/json").send(JSON.stringify({
                    error: `User with name ${req.params.get("name")} is not defined.`
                }), 404);
            }
        });
    }
}
__decorate([
    oomvc_1.Controller.get("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MainCtrl.prototype, "getMainPage", null);
__decorate([
    oomvc_1.Controller.post("/user"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MainCtrl.prototype, "newUser", null);
__decorate([
    oomvc_1.Controller.get("/user/:name"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MainCtrl.prototype, "getUser", null);
exports.default = new MainCtrl().init();
//# sourceMappingURL=MainCtrl.js.map