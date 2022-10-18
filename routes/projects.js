const express = require("express");
const router = express.Router();
const upload = require("../upload");
const db = require("../db");

router.get("/", (request, response) => {
    db.getProjects((error, projects) => {
        response.render("projects.hbs", {
            projects,
        });
    });
});

router.get("/create", (request, response) => {
    response.render("createProject.hbs");
});

router.post("/create", upload.single("image"), async(request, response) => {
    db.createProject(
        request.body.title,
        request.body.description,
        request.body.link,
        request.file,
        (error) => {
            response.redirect("/projects");
        }
    );
});

router.get("/:id", (request, response) => {
    db.getProject(request.params.id, (error, project) => {
        if (error) {
            console.log(error);
        } else {
            response.render("project.hbs", {
                project,
            });
        }
    });
});

router.get("/:id/edit", (request, response) => {
    db.getProject(request.params.id, (error, project) => {
        if (error) {
            console.log(error);
        } else {
            response.render("editProject.hbs", {
                project,
            });
        }
    });
});

router.post("/:id/edit", (request, response) => {
    db.updateProject(
        request.params.id,
        request.body.title,
        request.body.description,
        request.body.link,
        (error) => {
            response.redirect("/projects");
        }
    );
});

router.get("/:id/delete", (request, response) => {
    response.render("deleteProject.hbs", { id: request.params.id });
});

router.post("/:id/delete", (request, response) => {
    db.deleteProject(request.params.id, (error) => {
        response.redirect("/projects");
    });
});





module.exports = router;