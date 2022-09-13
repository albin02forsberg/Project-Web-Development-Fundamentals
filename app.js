const { response } = require("express");
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

app.get("/", (request, response) => {
    response.render("start.hbs");
});

app.get("/posts", (request, response) => {
    const model = {
        posts: dummyData.posts,
    };

    response.render("posts.hbs", model);
});

app.listen(8080);