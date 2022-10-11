const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (request, response) => {
    if (parseInt(request.query.page) < 1) {
        response.redirect("/posts?page=1");
    }

    db.paginatePosts(request.query.page, (error, posts, page) => {
        if (error) {
            console.log(error);
        } else {
            response.render("posts.hbs", {
                posts: posts,
                page: page,
            });
        }
    });
});

router.get("/create", (request, response) => {
    response.render("createPost.hbs");
});

router.get("/:id", (request, response) => {
    const id = request.params.id;

    db.getPost(id, (error, post, comments) => {
        if (error) {
            console.log(error);
        } else {
            response.render("post.hbs", {
                post: post,
                comments: comments,
            });
        }
    });
});

router.get("/:id/edit", (request, response) => {
    db.getPost(request.params.id, (error, post) => {
        if (error) {
            console.log(error);
        } else {
            response.render("editPost.hbs", {
                post: post,
            });
        }
    });
});

router.get("/:id/delete", (request, response) => {
    db.deletePost(request.params.id, (error) => {
        if (error) {
            console.log(error);
        } else {
            response.redirect("/posts");
        }
    });
});

router.post("/:id/delete", (request, response) => {
    const query = "DELETE FROM posts WHERE ID = ?";

    db.run(query, request.params.id, (error) => {
        if (error) {
            console.log(error);
            response.status(500).send("Something went wrong");
        } else {
            response.redirect("/posts");
        }
    });
});

router.get("/:id/edit", (request, params) => {
    db.getPost(request.params.id, (error, post) => {
        if (error) {
            console.log(error);
        } else {
            response.render("editPost.hbs", {
                post: post,
            });
        }
    });
});

router.post("/:id/edit", (request, response) => {
    db.editPost(
        request.params.id,
        request.body.title,
        request.body.subtitle,
        request.body.content,
        (error) => {
            if (error) {
                console.log(error);
            } else {
                response.redirect(`/posts/${request.params.id}`);
            }
        }
    );
});

router.post("/create", (request, response) => {
    db.createPost(
        request.body.title,
        request.body.subtitle,
        request.body.content,
        (error) => {
            if (error) {
                console.log(error);
                response.status(500).send("Something went wrong");
            } else {
                response.redirect("/posts");
            }
        }
    );
});

router.post("/:id/comment", (request, response) => {
    db.addComment(
        request.body.content,
        request.body.userName,
        request.params.id,
        (error) => {
            if (error) {
                console.log(error);
                response.status(500).send("Something went wrong");
            } else {
                response.redirect("/posts/" + request.params.id);
            }
        }
    );
});

module.exports = router;