const express = require("express");
const expressHandlebars = require("express-handlebars");

const dummyData = require("./dummyData");

const app = express();

app.engine(
    "hbs",
    expressHandlebars.engine({
        defaultLayout: "main.hbs",
    })
);

app.use(express.static("public"));
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));

app.get("/", (request, response) => {
    response.render("start.hbs");
});

app.get("/posts", (request, response) => {
    const model = {
        posts: dummyData.posts,
    };

    response.render("posts.hbs", model);
});

app.get("/posts/:id", (request, response) => {
    const id = request.params.id;
    const post = dummyData.posts.find((post) => post.id === parseInt(id));

    const model = {
        post,
    };

    response.render("post.hbs", model);
});

app.get("/contact", (request, response) => {
    response.render("contact.hbs");
});

app.listen(8080);