/**
 * Session data declarations
 */

declare module "express-session" {
    interface SessionData {
        authenticated: boolean,
        authorName: string
    }
}

export {}