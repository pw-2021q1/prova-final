import * as path from "path"

export const config = {
    "server-port": 3000,
    "db": {
        "url": "mongodb://localhost:27017",
        "name": "blog-system", 
        "collections": {
            "posts": "posts",
            "sequences": "sequences",
            "authors": "authors",
            "sessions": "sessions"
        }
    }, 
    "upload_dir": path.resolve(__dirname, "..", "uploads"),
    "secret": "ff743fb0dc08ee859d8a854157e6c54c"
}
