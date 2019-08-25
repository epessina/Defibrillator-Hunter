"use strict";

// Import key model
const Key = require("../models/key");

/* Checks if the systme sending the request has a valid key. */
module.exports = (req, res, next) => {

    // Retrieve the key from the request
    const keyHeader = req.get("App-Key");

    // If no key si found, throw a 403 error
    if (!keyHeader) {
        const error      = new Error("App not recognized.");
        error.statusCode = 403;
        throw error;
    }

    // Search the the key the database
    Key.findOne({ key: keyHeader })
        .then(result => {

            // If no key si found, throw a 403 error
            if (!result) {
                const error      = new Error("App not recognized.");
                error.statusCode = 403;
                throw error;
            }

            // Add the name of the caller to the request
            req.appName = result.app;

            // Call the next middleware
            next();

        })
        .catch(err => {

            // If the error does not have a status code, assign 500 to it
            console.error(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Call the next middleware
            next(err);

        });

};