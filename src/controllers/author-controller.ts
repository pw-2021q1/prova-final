import e from "express"
import * as bcrypt from "bcrypt"
import "../session-data"
import { Author, AuthorDAO } from "../models/author-model"

/**
 * Render the author login form
 * @param req the request
 * @param res the response
 */
export function loginForm(req: e.Request, res: e.Response) {
    res.render("authors/login")
}

/**
 * Process the author login form
 * @param req the request
 * @param res the response
 */
export async function loginFormProcessing(req: e.Request, res: e.Response) {
    const username = req.body.username as string || ""
    const password = req.body.password as string || ""
    const isValidLogin = () => username.trim().length > 0 && password.trim.length > 0

    try {
        if (isValidLogin())
            throw Error("Invalid login parameters")
        const retrAuthor = 
            await AuthorDAO.getInstance().findByUsername(username)
        if (await bcrypt.compare(password, retrAuthor.password)) {
            req.session.authenticated = true
            req.session.authorName = retrAuthor.username
            req.flash("type", "login")
            req.flash("name", retrAuthor.fullname)
            res.redirect("/")
        } else {
            throw Error("Login credentials did not match")
        }
    } catch (error) {
        req.session.authenticated = false
        console.error(error)
        res.render("authors/status", {type: "invalid_login"})
    }
}

/**
 * Invalid the author login session
 * @param req the request
 * @param res the response
 */
export function logout(req: e.Request, res: e.Response) {
    if (req.session.authenticated) {
        req.session.authenticated = false
        req.session.authorName = ""
        req.flash("type", "logout")
    }
    res.redirect("/")
}