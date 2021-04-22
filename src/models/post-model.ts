import { config } from "../../conf/config"
import * as dbConnect from "./db-connection"

/**
 * Blog post model
 * A post must have a single author
 */
export class Post {
    id: number
    title: string
    author: string // the author username
    date: string
    location: string
    content: string
    cover: string

    constructor(title: string, author: string,
        date: string, content: string) {
        this.id = 0
        this.title = title
        this.author = author
        this.date = date
        this.location = ""
        this.content = content
        this.cover = ""
    }

    isValid(): boolean {
        return this.title.length > 0 && this.author.length > 0
            && this.date.length > 0 && this.content.length > 0
    }

    /**
     * Convert a JSON representation to a Post instance
     * @param json the json representation
     * @returns the Post instance
     */
    static decode(json: any): Post {
        for (const prop of ["title", "author", "date", "content"]) {
            if (!(prop in json)) {
                throw new Error(`Field ${prop} is required`)
            }
        }

        const post = new Post(
            json.title, 
            json.author, 
            new Date(json.date).toUTCString(), 
            json.content)

        if ("id" in json) {
            post.id = parseInt(json.id)
        }
        if ("cover" in json) {
            post.cover = json.cover
        }
        if ("location" in json) {
            post.location = json.location
        }

        return post
    }
}

/**
 * Blog Post DAO Singleton
 */
export class PostDAO {
    private static instance: PostDAO

    private constructor() { }

    private getCollection() {
        return dbConnect.getDb().collection(config.db.collections.posts)
    }

    static getInstance(): PostDAO {
        if (!PostDAO.instance) {
            PostDAO.instance = new PostDAO()
        }

        return PostDAO.instance
    }

    /**
     * Insert a new post
     * @param post the post
     */
    async insert(post: Post): Promise<boolean> {
        // TODO
        return false
    }

    /**
     * List all posts
     */
    async listAll(): Promise<Post[]> {
        // TODO
        return []
    }

    /**
     * Find post using its id
     * @param id the post id
     */
    async findById(id: number): Promise<Post> {
        // TODO
        return new Post("", "", "", "")
    }

    /**
     * Update the given post in the database
     * (Assumes the post id already exists)
     * @param post the post
     */
    async update(post: Post): Promise<boolean> {
        try {
            const response = await this.getCollection().replaceOne(
                { id: post.id }, post)

            return (response) ? response.modifiedCount > 0 : false
        } catch (error) {
            console.error("Failed to update element")
            throw error
        }
    }

    /**
     * Remove the post with the given id.
     * @param id the id
     */
    async removeById(id: number): Promise<boolean> {
        try {
            const response = await this.getCollection().deleteOne({ id: id }, {})

            return (response.deletedCount) ? response.deletedCount > 0 : false
        } catch (error) {
            console.error("Failed to remove element")
            throw error
        }
    }

    /**
     * Generate a new post id using a db sequence.
     */
    async nextId(): Promise<number> {
        try {
            const seqColl = dbConnect.getDb()
                .collection(config.db.collections.sequences)
            const result = await seqColl.findOneAndUpdate(
                { name: "post_id" },
                { $inc: { value: 1 } })

            if (result.ok) {
                return result.value.value as number
            }

            throw Error("Failed to create new id in the database")
        } catch (error) {
            console.error("Failed to generate a new id")
            throw error
        }
    }
}
