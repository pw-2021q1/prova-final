import e from "express"
import * as fs from "fs"
import * as path from "path"
import multipartyExpress from "multiparty-express"
import { config } from "../../conf/config"
import "../session-data"
import { Post, PostDAO } from "../models/post-model"
import { Author, AuthorDAO } from "../models/author-model"

/**
 * Structure to join post and respective author
 */
interface PostAuthor {
    post: Post
    author: Author
}

/**
 * Joins the "posts" and "authors" collections
 * As an alternative, we could use lookup aggregation:
 * https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/
 * @param posts the posts list
 * @returns a PostAuthor list
 */
async function joinPostAuthor(posts: Post[]) {
    try {
        const postAuthorList: PostAuthor[] = []

        for (const post of posts) {
            postAuthorList.push({
                post: post,
                author: await AuthorDAO.getInstance().findByUsername(post.author)
            })
        }

        return postAuthorList
    } catch (error) {
        console.error("Failed to join posts and authors collections")
        throw error
    }
}

/**
 * List all posts.
 * @param req the request object
 * @param res the response object
 */
export async function list(req: e.Request, res: e.Response) {
    try {
        res.render('posts/list', {
            postAuthorList:  await joinPostAuthor(await PostDAO.getInstance().listAll())
        })
    } catch(error) {
        console.error("Failed to render posts list")
        console.error(error)
        res.render("posts/status", {
            type: "list_error"
        })
    }
}

/**
 * Show the details of a post.
 * @param req the request object
 * @param res the response object
 */
export async function details(req: e.Request, res: e.Response) {
    const id = parseInt(req.params.id) || 0

    try {
        res.render("posts/details", {
            postAuthor: (await joinPostAuthor([await PostDAO.getInstance().findById(id)])).pop()
        })
    } catch(error) {
        console.error("Failed to obtain post details")
        console.error(error)
        res.render("posts/status", {
            type: "unknown_post", 
            params: {
                id: req.params.id
            }
        })        
    }
}

/**
 * Render the post insertion form.
 * @param req the request
 * @param res the response
 */
export function addForm(req: e.Request, res: e.Response) {
    res.render("posts/add", {
        post: new Post("", req.session.authorName || "", new Date().toUTCString(), "")
    })
 }

 /**
  * Save form data to database and image to disk.
  * @param req the request
  * @param res the response
  * @param edit true if data comes the edit form, false if it comes from insertion form
  */
 async function save(req: e.Request, res: e.Response, edit: boolean) {
    /**
     * Converts a multiparty express fields object to a 
     * simplified json notation
     * @param fields a multiparty express fields object
     * @returns a json representation of the fields
     */
    const parseFields = (fields: multipartyExpress.Fields) => {
        const json: any = {}

        for (const key in fields) {
            json[key] = fields[key].pop()
        }

        return json
    }
    
    /**
     * Copy the uploaded file to the upload dir
     * @param file the uploaded file
     * @returns the copied file name
     */
    const savePicture = async (file: multipartyExpress.File | undefined) => {
        try {
            const fileInfo = await fs.promises.stat(file?.path || "")

            if (file && fileInfo.isFile() && fileInfo.size > 0) {
                const filename = path.basename(file.path)
                const newPath = path.join(config.upload_dir, filename)

                await fs.promises.copyFile(file.path, newPath)

                return filename
            } 
        } catch (error) {
            console.error("Failed to copy post cover to storage folder")
            console.error(error)
            throw error
        }

        return ""
    }

    try {
        const post = Post.decode(parseFields(req.fields))

        if (post.isValid()) {
            if ("picture" in req.files) {
                post.cover = 
                    await savePicture(req.files["picture"].pop())
            }
            if (edit) { // edit
                if (await PostDAO.getInstance().update(post)) {
                    res.render("posts/status", {type: "post_edit_success"})
                } else {
                    throw Error("Failed to update post in the database")
                }
            } else { // insert
                if (await PostDAO.getInstance().insert(post)) {
                    res.render("posts/status", {type: "post_add_success"})
                } else {
                    throw Error("Failed to insert post in the database")
                }
            }
        } else {
            throw Error("Invalid fields in the form. Please try again.")
        }
    } catch (error) {
        console.error(error)
        console.error(error)
        res.render("posts/status", {
            type: (edit) ? "post_edit_error" : "post_add_error"
        })
    }
 }

 /**
  * Process the insertion form.
  * @param req the request
  * @param res the response
  */
 export async function addFormProcessing(req: e.Request, res: e.Response) {
    save(req, res, false)
 }

 /**
  * Render the edit form.
  * @param req the request
  * @param res the response
  */
 export async function editForm(req: e.Request, res: e.Response) {
     const id = parseInt(req.params.id) || 0

     try {
         res.render("posts/edit", {
             post: await PostDAO.getInstance().findById(id)
         })
     } catch (error) {
         console.error(error)
         console.error(error)
         res.render("posts/status", {type: "post_edit_load_error"})
     }
 }

 /**
  * Process the edit form.
  * @param req the request
  * @param res the response
  */
 export function editFormProcessing(req: e.Request, res: e.Response) {
     save(req, res, true)
 }

 /**
  * Process the remove form.
  * @param req the request
  * @param res the response
  */
 export async function removeFormProcessing(req: e.Request, res: e.Response) {
     const id = parseInt(req.body.id) || 0     
       
     try {
         /**
          * Remove the post cover file
          */
        const post = await PostDAO.getInstance().findById(id)

        fs.promises.rm(path.join(config.upload_dir, post.cover))

        /**
         * Remove the post
         */
         if (await PostDAO.getInstance().removeById(id)) {
            res.render("posts/status", {type: "post_remove_success"})
         } else {
             throw Error("Failed to remove post")
         }
     } catch (error) {
         console.error(error)
         console.error(error)
         res.render("posts/status", {type: "post_remove_error"})
     }
 }
