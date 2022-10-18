const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const bodyParser = require("body-parser");
const dummyData = require("./dummyData");
const encrypt = require("./encrypt");
const sqlite3 = require("sqlite3").verbose();

const postRoutes = require("./routes/posts");
const projectRoutes = require("./routes/projects");

const PORT = 8080;
const ADMIN_USERNAME = "admin";
// const ADMIN_PASSWORD = "password";
const ADMIN_PASSWORD =
    "$2b$04$TcGjpTtW4RGOinq.7yL5reDaOzwK47PbV6Z2lHmlLsKWIXeHkFcKK";

const db = new sqlite3.Database("blog.db");

db.run(
    "CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, subtitle TEXT, content TEXT, date DATE)"
);

db.run(
    "CREATE TABLE IF NOT EXISTS postComment (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT, userName TEXT, postId INTEGER, date DATE, FOREIGN KEY(postId) REFERENCES posts(id))"
);

db.run(
    "CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, link TEXT, date DATE, imgSource TEXT)"
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

app.use("/posts", postRoutes);
app.use("/projects", projectRoutes);

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

    encrypt.decrypt(password, ADMIN_PASSWORD, (error, decryptedPassword) => {
        console.log("decryptedPassword", decryptedPassword);
        if (decryptedPassword && userName === ADMIN_USERNAME) {
            request.session.loggedIn = true;
            response.redirect("/");
        } else {
            response.render("login.hbs", {
                error: "Wrong username or password",
            });
        }
    });
});

app.get("/logout", (request, response) => {
    request.session.loggedIn = false;
    response.redirect("/");
});

app.get("/contact", (request, response) => {
    response.render("contact.hbs");
});

app.get("/about", (request, response) => {
    response.render("about.hbs", { title: "About" });
});

app.listen(PORT, () => {
    console.log("Server started (http://localhost:" + PORT + "/)");
});