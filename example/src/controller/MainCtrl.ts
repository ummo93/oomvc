import { Controller } from "oomvc";
import { Response } from "oomvc/lib/Response";
import { Request } from "oomvc/lib/Request";
import { User } from '../model/User'

class MainCtrl extends Controller {

    protected viewPath = "./src/views/"; // Redefining view path. Defaults = "./src/views/"
    protected partialsPath = "./src/views/inc/"; // Redefine path to handlebars partials. Defaults = "./src/views/"

    @Controller.get("/")
    private getMainPage(req: Request, res: Response): void {
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

    @Controller.post("/user")
    private newUser(req: Request, res: Response) {
        const user = new User({name: req.body.toJSON().name, birthday: new Date()});
        user.post().then(() => {
            res.type("application/json").send(JSON.stringify(user.get()), 200);
        });
    }

    @Controller.get("/user/:name")
    private async getUser(req: Request, res: Response) {
        try {
            let user = await User.findOne({ where: { name: req.params.get("name") } });
            res.type("application/json").send(JSON.stringify(user.get()), 200);
        } catch(e) {
            res.type("application/json").send(JSON.stringify({
                error: `User with name ${req.params.get("name")} is not defined.`
            }), 404);
        }
    }
}

export default new MainCtrl().init();