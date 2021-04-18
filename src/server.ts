import e from 'express'
import path from 'path'
import hbs from "express-handlebars"
import {multipartyExpress as multiparty, cleanup} from "multiparty-express"
import session from "express-session"
import flash from "express-flash"

import {config} from "../conf/config"
import * as dbConnect from "./models/db-connection"
import * as postController from "./controllers/post-controller"
import * as authorController from "./controllers/author-controller"

const app = e()

/**
 * Configure session middleware
 */
app.use(session({
    secret: config.secret, 
    resave: false,
    saveUninitialized: false,
    store: dbConnect.sessionStore
}))
app.use((req, res, next) => {
    res.locals.authenticated = (req.session.authenticated) ? true : false
    next()
})

/**
 * Configure templating engine
 */
app.engine("handlebars", hbs({
    helpers: {
        equals: (a: string, b: string) => a == b,
        isEmpty: (s: string) => !s || s.length == 0,
        isNotEmpty: (s: string) => s && s.length > 0,
        shorten: (s: string) => s.substring(0, 100) + "...",
        formatDate: (d: string) => d.substring(0,16),
        toISODate: (d: string) => new Date(d).toISOString().substring(0,10)
    }
}))
app.set("view engine", "handlebars")
app.set("views", path.resolve(__dirname, "..", "views"))

/**
 * Custom authentication middleware
 */
function authenticate(req: e.Request, res: e.Response, next: e.NextFunction) {
    if (req.session.authenticated) {
        next()
    } else {
        res.redirect("/login")
    }
}

/**
 * Flash message middleware
 */
app.use(flash())

/**
 * Static routes
 */
app.use('/static', e.static(path.join(__dirname, '..', 'static')));
app.use('/picture', e.static(config.upload_dir));

/**
 * Dynamic routes
 */

/**
 * Posts
 */
app.get("/", (req, res) => {
    res.redirect("/list")
})
app.get("/list", postController.list)
app.get("/post/:id", postController.details)
app.get("/add", authenticate, postController.addForm)
app.post("/add", authenticate, multiparty(), (req, res) => {
    postController.addFormProcessing(req, res)
    cleanup(req)
})
app.get("/edit/:id", authenticate, postController.editForm)
app.post("/edit", authenticate, multiparty(), (req, res) => {
    postController.editFormProcessing(req, res)
    cleanup(req)
})
app.post("/remove", authenticate, e.urlencoded({extended: true}), 
    postController.removeFormProcessing)

/**
 * Authors
 */
app.get("/login", authorController.loginForm)
app.post("/login", e.urlencoded({extended: true}), 
    authorController.loginFormProcessing)
app.get("/logout", authorController.logout)

/**
 * Server stack set-up
 */
console.log("Starting server stack...")
dbConnect.connect()
    .then(() => {
        app.listen(config["server-port"], () => {
            console.log(`Server listening at ${config["server-port"]}`)
        })
    })
    .catch(error => {
        console.error("Failed to load server stack")
        console.error(error.stack)
    })


/**
 * Server stack tear-down
 */
process.on('exit', (code) => {
    console.log(`Server exiting with code ${code}`)
});
function exitHandler() {
    dbConnect.disconnect()
        .then(() => process.exit())
        .catch(error => {
            console.error("Failed to shutdown server stack")
            console.error(error.stack)
        })
}
process.once('SIGINT', exitHandler)
process.once('SIGUSR2', exitHandler)
