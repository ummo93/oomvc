import { Server } from "http";
import { Application } from "oomvc";
import { Sequelize } from 'sequelize-typescript';
import mainCtrl from './controller/MainCtrl';
import * as path from "path";

class MainServer extends Application {

    public port = process.env.PORT || 5000;
    public staticPath = "./public";
    public controllers = [
        mainCtrl
    ];

    public start(instance: Server) {
        new Sequelize({
            name: 'pures',
            username: 'root',
            password: '',
            host: '127.0.0.1',
            dialect: 'mysql',
            modelPaths: [path.resolve(__dirname + '/model')]
        });
        instance.listen(this.port, () => {
            console.log('[%d] Server start at port %d', process.pid, this.port);
        });
    }
}

export default new MainServer().init();