# Object oriented web framework for NodeJS (TypeScript).

[![NPM](https://img.shields.io/npm/v/oomvc.svg)](https://www.npmjs.com/package/oomvc)
[![NPM Downloads](https://img.shields.io/npm/dm/oomvc.svg)](https://npmjs.org/package/oomvc)

Object oriented web framework. OOMVC is a web framework with a minimal number of 
dependencies (handlebars templating engine only). Founded on pure http.Server.
### Server
```typescript
import { Application } from "oomvc";
import { Server } from "http";
import mainCtrl from './controller/MainCtrl';
 
class MainServer extends Application {
 
    public port = process.env.PORT || 5000;
    public staticPath = "./public";
    public controllers = [
        mainCtrl
    ];
 
    public start(instance: Server) {
        instance.listen(this.port, () => {
            console.log('[%d] Server start at port %s', process.pid, this.port);
        });
    }
}
 
export default new MainServer().init();
```
### Controller
```typescript
import { Controller } from "oomvc";
import { Response } from "oomvc/lib/Response";
import { Request } from "oomvc/lib/Request";
 
class MainCtrl extends Controller {
 
    public viewPath = "./src/views/"; // Redefining view path. Defaults = "./src/views/"
     
     @Controller.get("/hello/:name")
     private getUser(req: Request, res: Response) {
         res.send(`Hello ${req.params.get("name")}!`, 200);
     }
     
    @Controller.get("/")
    private getMainPage(req: Request, res: Response): void {
        let data = {
            "name": "Alan",
            "cook": req.cookies["Test"],
            "hometown": "Somewhere, TX",
            "kids": [
                { "name": "Jimmy", "age": "14" },
                { "name": "Sally", "age": "10" }
            ]
        };
        res.cookie("Test", "12356");
        this.render("index", data).then(template => {
            res.send(template, 200);
        }).catch(error => {
            res.send(error, 404);
        });
    }
}
 
export default new MainCtrl();
```
## Model
For Model components i recommend using [sequelize-typescript](https://github.com/RobinBuschmann/sequelize-typescript/) package since it uses the most acceptable and similar syntax.

## Installation

```bash
$ npm install oomvc
```

## Documentation
For details, use the [wiki](https://github.com/ummo93/oomvc/wiki/).

You can also look at the sample application (oomvc + sequelize-typescript) at ./example folder.

## License

  [MIT](LICENSE)