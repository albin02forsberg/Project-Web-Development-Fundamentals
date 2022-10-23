const express = require("express");
const router = express.Router();
const db = require("../db");

const POST_TITLE_MAX_LENGHT = 100;
const POST_SUBTITLE_MAX_LENGHT = 200;
const POST_CONTENT_MAX_LENGHT = 10000;
const POST_CONTENT_MIN_LENGHT = 100;
const COMMENT_MAX_LENGHT = 1000;
const COMMENT_MIN_LENGHT = 3;

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
    let commentError = false;

    if (request.query.error) {
        commentError = true;
    }

    db.getPost(id, (error, post, comments) => {
        if (error) {
            console.log(error);
        } else {
            if (!post) {
                response.redirect("/posts");
            } else {
                response.render("post.hbs", {
                    post: post,
                    comments: comments,
                    error: commentError,
                });
            }
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

router.get("/:id/delete-comment/:commentId/", (request, response) => {
    console.log(request.params);
    response.render("deleteComment.hbs", {
        id: request.params.id,
        commentId: request.params.commentId,
    });
});

router.post("/:id/delete-comment/:commentId/", (request, response) => {
    db.deleteComment(request.params.commentId, (error) => {
        if (error) {
            console.log(error);
        } else {
            response.redirect(`/posts/${request.params.id}`);
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
    let errors = [];

    if (request.body.title.length > POST_TITLE_MAX_LENGHT) {
        errors.push("Title is too long");
    }
    if (request.body.subtitle.length > POST_SUBTITLE_MAX_LENGHT) {
        errors.push("Subtitle is too long");
    }
    if (request.body.content.length > POST_CONTENT_MAX_LENGHT) {
        errors.push("Content is too long");
    }
    if (request.body.content.length < POST_CONTENT_MIN_LENGHT) {
        errors.push("Content is too short");
    }
    if (request.body.title.length === 0) {
        errors.push("Title is required");
    }
    if (request.body.subtitle.length === 0) {
        errors.push("Subtitle is required");
    }

    if (errors.length <= 0) {
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
    } else {
        response.render("editPost.hbs", {
            error: true,
            errors: errors,
            post: {
                id: request.params.id,
                title: request.body.title,
                subtitle: request.body.subtitle,
                content: request.body.content,
            },
        });
    }
});

router.post("/create", (request, response) => {
    let errors = [];
    if (
        request.body.title.length < 1 ||
        request.body.subtitle.length < 1 ||
        request.body.content.length < 1
    ) {
        errors.push("Please fill in all fields");
    }
    if (request.body.title.length > POST_TITLE_MAX_LENGHT) {
        errors.push(
            "Title must be less than " + POST_TITLE_MAX_LENGHT + " characters"
        );
    }
    if (request.body.subtitle.length > POST_SUBTITLE_MAX_LENGHT) {
        errors.push(
            "Subtitle must be less than " + POST_SUBTITLE_MAX_LENGHT + " characters"
        );
    }
    if (request.body.content.length > POST_CONTENT_MAX_LENGHT) {
        errors.push(
            "Content must be less than " + POST_CONTENT_MAX_LENGHT + " characters"
        );
    }
    if (request.body.content.length < POST_CONTENT_MIN_LENGHT) {
        errors.push(
            "Content must be more than " + POST_CONTENT_MIN_LENGHT + " characters"
        );
    }

    if (errors.length <= 0) {
        db.createPost(
            request.body.title,
            request.body.subtitle,
            request.body.content,
            (error) => {
                if (error) {
                    console.log(error);
                } else {
                    response.redirect("/posts");
                }
            }
        );
    } else {
        response.render("createPost.hbs", {
            error: true,
            errors: errors,
            title: request.body.title,
            subtitle: request.body.subtitle,
            content: request.body.content,
        });
    }
});

router.post("/:id/comment", (request, response) => {
    let errors = [];

    if (request.body.content.length < COMMENT_MIN_LENGHT) {
        errors.push(
            "Comment must be more than " + COMMENT_MIN_LENGHT + " characters"
        );
    }
    if (request.body.content.length > COMMENT_MAX_LENGHT) {
        errors.push(
            "Comment must be less than " + COMMENT_MAX_LENGHT + " characters"
        );
    }

    if (request.body.userName === "") {
        request.body.userName = "Anonymous";
    }

    if (errors.length <= 0) {
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
    } else {
        response.redirect("/posts/" + request.params.id + "?error=true");
    }
});

module.exports = router;