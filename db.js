const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("blog.db");
const path = require("path");
const Resize = require("./resize");

db.run(
    "CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, subtitle TEXT, content TEXT, date DATE)"
);

db.run(
    "CREATE TABLE IF NOT EXISTS postComment (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT, userName TEXT, postId INTEGER, date DATE, FOREIGN KEY(postId) REFERENCES posts(id))"
);

db.run(
    "CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, date DATE, imgSource TEXT)"
);

// Posts

exports.paginatePosts = function(param, callback) {
    let page = {
        previous: -1 + parseInt(param || 1),
        current: 0 + parseInt(param || 1),
        next: 1 + parseInt(param || 1),
        isMorePosts: true,
        isLessPosts: true,
    };

    const query = "SELECT * FROM posts ORDER BY id DESC LIMIT ? , 4";

    db.all(query, [(page.current - 1) * 4], (error, posts) => {
        if (error) {
            callback(error);
        } else {
            const queryMore = "SELECT * FROM posts ORDER BY id DESC LIMIT ? , 4";
            db.all(queryMore, [(page.next - 1) * 4], (error, postsMore) => {
                if (error) {
                    callback(error);
                } else {
                    if (postsMore.length > 0) {
                        page.isMorePosts = true;
                    } else {
                        page.isMorePosts = false;
                    }
                    if (page.current === 1) {
                        page.isLessPosts = false;
                    }
                }
                callback(error, posts, page);
            });
        }
    });
};

exports.getPost = function(id, callback) {
    const query = "SELECT * FROM posts WHERE id = ?";

    db.get(query, id, (error, post) => {
        if (error) {
            callback(error);
        } else {
            const queryComments =
                "SELECT * FROM postComment WHERE postId = ? ORDER BY date DESC";

            db.all(queryComments, id, (error, comments) => {
                if (error) {
                    callback(error);
                } else {
                    callback(error, post, comments);
                }
            });
        }
    });
};

exports.createPost = function(title, subtitle, content, callback) {
    const query =
        "INSERT INTO posts (title, subtitle, content, date) VALUES (?, ?, ?, ?)";

    db.run(query, title, subtitle, content, new Date(), (error) => {
        callback(error);
    });
};

exports.deletePost = function(id, callback) {
    const query = "DELETE FROM posts WHERE id = ?";

    db.run(query, id, (error) => {
        if (error) {
            callback(error);
        } else {
            callback(error);
        }
    });
};

exports.editPost = function(id, title, subtitle, content, callback) {
    const query =
        "UPDATE posts SET title = ?, subtitle = ?, content = ? WHERE id = ?";
    db.run(query, title, subtitle, content, id, (error) => {
        callback(error);
    });
};

exports.addComment = function(content, userName, postId, callback) {
    const query =
        "INSERT INTO postComment (content, userName, postId, date) VALUES (?, ?, ?, ?)";

    db.run(query, content, userName, postId, new Date(), (error) => {
        callback(error);
    });
};

// Projects

exports.getProjects = function(callback) {
    const query = "SELECT * FROM projects ORDER BY date DESC";

    db.all(query, (error, projects) => {
        callback(error, projects);
    });
};

exports.getProject = function(id, callback) {
    const query = "SELECT * FROM projects WHERE id = ?";
    db.get(query, id, (error, project) => {
        callback(error, project);
    });
};

exports.createProject = async function(
    title,
    description,
    link,
    file,
    callback
) {
    const imagePath = path.join(__dirname, "./public/images/");
    const uploadImg = new Resize(imagePath);

    if (!file) {
        response.status(401).json({ error: "Please provide an image" });
    }

    console.log(file);

    const filename = await uploadImg.save(file.buffer);

    console.log(filename);

    const query =
        "INSERT INTO projects (title, description, link, date, imgSource) VALUES (?, ?, ?, ?, ?)";
    console.log(query);

    db.run(query, [title, description, link, new Date(), filename], (error) => {
        console.log(error);
        callback(error);
    });
};

exports.updateProject = function(id, title, description, link, callback) {
    const query =
        "UPDATE projects SET title = ?, description = ?, link = ? WHERE id = ?";
    db.run(query, [title, description, link, id], (error) => {
        callback(error);
    });
};

exports.deleteProject = function(id, callback) {
    const query = "DELETE FROM projects WHERE id = ?";
    db.run(query, id, (error) => {
        callback(error);
    });
};

exports.deleteComment = function(id, callback) {
    const query = "DELETE FROM postComment WHERE id = ?";
    db.run(query, id, (error) => {
        callback(error);
    });
};