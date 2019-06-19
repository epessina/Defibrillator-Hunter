"use strict";

const Key = require("../models/key");

module.exports = (req, res, next) => {

    const keyHeader = req.get("App-Key");

    if (!keyHeader) {
        const error      = new Error("App not recognized.");
        error.statusCode = 403;
        throw error;
    }

    Key.findOne({key: keyHeader})
        .then(result => {

            if (!result) {
                const error      = new Error("App not recognized.");
                error.statusCode = 403;
                throw error;
            }

            req.appName = result.app;
            next();
        })
        .catch(err => {
            console.error(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }
            next(err);
        });

};