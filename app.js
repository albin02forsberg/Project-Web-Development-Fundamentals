const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const bodyParser = require("body-parser");
const upload = require("./upload");
const path = require("path");
const dummyData = require("./dummyData");
const Resize = require("./resize");
const sqlite3 = require("sqlite3").verbose();
const postRoutes = require("./routes/posts");

const PORT = 8091;
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password";

const db = new sqlite3.Database("blog.db");

db.run(
    "CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, subtitle TEXT, content TEXT, date DATE)"
);

db.run(
    "CREATE TABLE IF NOT EXISTS postComment (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT, userName TEXT, postId INTEGER, date DATE, FOREIGN KEY(postId) REFERENCES posts(id))"
);

db.run(
    "CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, date DATE, imgSource TEXT)"
);

const app = express();

app.engine(
    "hbs",
    expressHandlebars.engine({
        defaultLayout: "main.hbs",
    })
);
app
    .use(express.static("public"))
    .use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    // .use(express.urlencoded({ extended: false }))
    .use(
        expressSession({
            secret: "secret",
            resave: false,
            saveUninitialized: false,
        })
    )
    .use(function(request, response, next) {
        response.locals.session = request.session;
        next();
    });

function mdToHtml(md) {
    const html = md
        .replace(/^##### (.*)/gm, "<h5>$1</h5>")
        .replace(/^#### (.*)/gm, "<h4>$1</h4>")
        .replace(/^### (.*)$/gm, "<h3>$1</h3>")
        .replace(/^## (.*)$/gm, "<h2>$1</h2>")
        .replace(/^# (.*)$/gm, "<h1>$1</h1>")
        .replace(/\*\*(.*)\*\*/gm, "<strong>$1</strong>")
        .replace(/\*(.*)\*/gm, "<em>$1</em>")
        .replace(/!\[(.*)\]\((.*)\)/gm, "<img src='$2' alt='$1' />")
        .replace(/\[(.*)\]\((.*)\)/gm, "<a href='$2'>$1</a>")
        .replace(/^- (.*)/gm, "<li>$1</li>")
        .replace(/^(.*)$/gm, "<p>$1</p>");

    return html;
}

app.use("/posts", postRoutes);

app.get("/", (request, response) => {
    const model = {
        session: request.session,
    };

    response.render("start.hbs", model);
});

app.get("/search", (request, response) => {
    const query = "SELECT * FROM posts WHERE content LIKE '%' || ? || '%' ";

    db.all(query, [request.query.search], (error, posts) => {
        response.render("search.hbs", {
            posts,
        });
    });
});

app.get("/login", (request, response) => {
    response.render("login.hbs");
});

app.post("/login", (request, response) => {
    const userName = request.body.username;
    const password = request.body.password;

    if (userName == ADMIN_USERNAME && password == ADMIN_PASSWORD) {
        request.session.loggedIn = true;
        response.redirect("/");
    } else {
        response.render("login.hbs", {
            isError: true,
            error: "Wrong username or password",
        });
    }
});

app.get("/contact", (request, response) => {
    response.render("contact.hbs");
});

app.get("/about", (request, response) => {
    response.render("about.hbs", { title: "About" });
});

app.get("/projects", (request, response) => {
    const query = "SELECT * FROM projects";

    db.all(query, (error, projects) => {
        if (error) {
            console.log(error);
        } else {
            response.render("projects.hbs", {
                projects: projects,
            });
        }
    });
});

app.get("/projects/create", (request, response) => {
    response.render("createProject.hbs");
});

app.post(
    "/projects/create",
    upload.single("image"),
    async(request, response) => {
        const imagePath = path.join(__dirname, "public/images");
        const uploadImg = new Resize(imagePath);

        console.log(request.file);

        if (!request.file) {
            response.status(401).json({ error: "Please provide an image" });
        }

        const filename = await uploadImg.save(request.file.buffer);

        console.log("FILE", filename);

        const query =
            "INSERT INTO projects (title, description, imgSource, date) VALUES (?, ?, ?, ?)";

        db.run(
            query, [
                request.body.title,
                request.body.description,
                "images/" + filename,
                new Date(),
            ],
            (error) => {
                if (error) {
                    console.log(error);
                } else {
                    response.redirect("/projects");
                }
            }
        );
    }
);
app.listen(PORT, () => {
    console.log("Server started (http://localhost:" + PORT + "/");
});