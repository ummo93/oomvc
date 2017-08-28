"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oomvc_1 = require("oomvc");
const sequelize_typescript_1 = require("sequelize-typescript");
const MainCtrl_1 = require("./controller/MainCtrl");
const path = require("path");
class MainServer extends oomvc_1.Application {
    constructor() {
        super(...arguments);
        this.port = process.env.PORT || 5000;
        this.staticPath = "./public";
        this.controllers = [
            MainCtrl_1.default
        ];
    }
    start(instance) {
        new sequelize_typescript_1.Sequelize({
            name: 'pures',
            username: 'root',
            password: '',
            host: '127.0.0.1',
            dialect: 'mysql',
            modelPaths: [path.resolve(__dirname + '/model')]
        });
        instance.listen(this.port, () => {
            console.log('[%d] Server start at port %s', process.pid, this.port);
        });
    }
}
exports.default = new MainServer().init();
//# sourceMappingURL=MainServer.js.map