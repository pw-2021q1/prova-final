import * as dbConnection from "./db-connection"
import {config} from "../../conf/config"
import * as dbConnect from "./db-connection"

/**
 * Author model
 */
export class Author {
    id: number
    username: string
    fullname: string
    email: string
    password: string

    constructor(username: string, password: string, fullname: string, email: string) {
        this.id = 0
        this.username = username
        this.email = email
        this.fullname = fullname
        this.password = password
    }

    isValid() {
        return this.username.length > 0 && this.password.length > 0
    }

    /**
     * Convert a JSON representation to an Author instance
     * @param json the JSON representation
     * @returns the Author instance
     */
    static decode(json: any): Author {
        for (const prop of ["email", "password", "username"]) {
            if (!(prop in json)) {
                throw new Error(`Property ${prop} is required`)
            }
        }

        const author = new Author(json.username, json.password, json.fullname, json.email)

        if ("id" in json) {
            author.id = parseInt(json.id)
        }
        
        if ("fullname" in json) {
            author.fullname = json.fullname
        }

        return author
    }
}

/**
 * Author DAO Singleton
 */
export class AuthorDAO {
    private static instance: AuthorDAO

    private constructor() {}

    static getInstance() {
        if (!this.instance) {
            this.instance = new AuthorDAO()
        }
        return this.instance
    }
    
    getCollection() {
        return dbConnection.getDb().collection(config.db.collections.authors)
    }

    /**
     * Retrieve an author given its username
     * @param username the author username
     * @returns the author
     */
    async findByUsername(username: string): Promise<Author> {
        try {
            const response = await this.getCollection().findOne({username: username})

            if (response) {
                return Author.decode(response)
            }
            throw Error("Failed to retrieve author with given username")
        } catch (error) {
            console.error("Error while retrieving author")
            throw error
        }
    }
}