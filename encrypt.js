const bcrypt = require("bcrypt");

exports.decrypt = function(password, hash, callback) {
    bcrypt.compare(password, hash, function(error, result) {
        if (error) {
            callback(error);
        } else {
            callback(null, result);
        }
    });
};