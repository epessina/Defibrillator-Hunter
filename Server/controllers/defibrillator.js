"use strict";

// Built in modules for path manipulation
const fs   = require("fs"),
      path = require("path");

const Defibrillator        = require("../models/defibrillator"), // Model of the defibrillator
      User                 = require("../models/user"),          // Model of the user
      { validationResult } = require("express-validator/check"); // Module for retrieving the validation results


/* Retrieves all the defibrillators. */
exports.getDefibrillators = (req, res, next) => {

    // Find all the defibrillators
    Defibrillator.find({})
        .then(defibrillators => {

            // Send a success response
            res.status(200).json({ message: "Fetched data successfully", defibrillators: defibrillators })

        })
        .catch(err => {

            console.error(err);

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Call the next middleware
            next(err);

        });
};


/* Retrieves all the defibrillators mapped by a user. */
exports.getUserDefibrillators = (req, res, next) => {

    // Extract the id form the request
    const id = req.params.userId;

    // If the id of the user is not the one of the calling user, throw a 401 error
    if (id !== req.userId) {
        const error      = new Error("Not authorized.");
        error.statusCode = 401;
        throw error;
    }

    // Find all the defibrillators of the user that are not marked for deletion
    Defibrillator.find({ user: req.userId, markedForDeletion: false })
        .then(defibrillators => {

            // Send a success response
            res.status(200).json({ message: "Fetched data successfully", defibrillators: defibrillators })

        })
        .catch(err => {

            console.error(err);

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Call the next middleware
            next(err);

        });

};


/* Retrieves a single defibrillator. */
exports.getDefibrillator = (req, res, next) => {

    // Extract the id form the request
    const id = req.params.defibrillatorId;

    // Find the defibrillator by id
    Defibrillator.findById(id)
        .then(defibrillator => {

            // If no landslide is found, throw a 404 error
            if (!defibrillator) {
                const error      = new Error("Could not find defibrillator.");
                error.statusCode = 404;
                throw error;
            }

            // If the user who has mapped the landslide is not the calling user, throw a 401 error
            if (defibrillator.user.toString() !== req.userId) {
                const error      = new Error("Not authorized.");
                error.statusCode = 401;
                throw error;
            }

            // Send a success response
            res.status(200).json({ message: "Defibrillator found!", defibrillator: defibrillator })

        })
        .catch(err => {

            console.error(err);

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Call the next middleware
            next(err);

        });


};


/* Inserts a new defibrillator into the database. */
exports.postDefibrillator = (req, res, next) => {

    // Extract the validation results
    const errors = validationResult(req);

    // If there are some validation errors, throw a 422 error
    if (!errors.isEmpty()) {
        const error      = new Error("Defibrillator validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    // Extract the coordinates from the body of the request
    const coordinates = JSON.parse(req.body.coordinates);

    // If the coordinates are in the wrong format, throw a 422 error
    if (coordinates.length !== 2 || typeof coordinates[0] !== "number" || typeof coordinates[1] !== "number") {
        const error      = new Error("Defibrillator validation failed. Entered data is incorrect.");
        error.errors     = [{
            location: "body",
            msg     : "Invalid coordinates value",
            param   : "coordinates",
            value   : coordinates
        }];
        error.statusCode = 422;
        throw error;
    }

    // If no image has been passed with the request, throw a 422 error
    if (!req.file) {
        const error      = new Error("Defibrillator validation failed. Entered data is incorrect.");
        error.errors     = [{ location: "body", msg: "You must provide a photo", param: "imageUrl", value: "" }];
        error.statusCode = 422;
        throw error;
    }

    // Create a new defibrillator
    const defibrillator = new Defibrillator({
        user                 : req.userId,
        coordinates          : coordinates,
        accuracy             : req.body.accuracy,
        presence             : req.body.presence,
        locationCategory     : req.body.locationCategory,
        transportType        : req.body.transportType,
        visualReference      : req.body.visualReference,
        floor                : req.body.floor,
        temporalAccessibility: req.body.temporalAccessibility,
        recovery             : req.body.recovery,
        signage              : req.body.signage,
        brand                : req.body.brand,
        notes                : req.body.notes,
        imageUrl             : req.file.path.replace("\\", "/"),
        imageCoordinates     : req.body.imageCoordinates
    });

    // Save the new defibrillator
    defibrillator.save()
        .then(() => {

            // Find the user that has mapped the landslide
            return User.findById(req.userId);

        })
        .then(user => {

            // Save the defibrillator among the user's ones
            user.defibrillators.push(defibrillator);

            // Update the user
            return user.save();

        })
        .then(() => {

            // Send a successful response
            res.status(201).json({ message: "Defibrillator created", defibrillator: defibrillator });

        })
        .catch(err => {

            console.error(err);

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Call the next middleware
            next(err);

        });

};


/* Updates an existing defibrillator. */
exports.updateDefibrillator = (req, res, next) => {

    // Extract the id form the request
    const id = req.params.defibrillatorId;

    // Extract the validation results
    const errors = validationResult(req);

    // If there are some validation errors, throw a 422 error
    if (!errors.isEmpty()) {
        const error      = new Error("Landslide validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    // Find the defibrillator by id
    Defibrillator.findById(id)
        .then(defibrillator => {

            // If no defibrillator is found, throw a 404 error
            if (!defibrillator) {
                const error      = new Error("Could not find defibrillator.");
                error.statusCode = 404;
                throw error;
            }

            // If the user who has mapped the defibrillator is not the calling user, throw a 401 error
            if (defibrillator.user.toString() !== req.userId) {
                const error      = new Error("Not authorized.");
                error.statusCode = 401;
                throw error;
            }

            // Save the new values
            defibrillator.presence              = req.body.presence;
            defibrillator.locationCategory      = req.body.locationCategory;
            defibrillator.transportType         = req.body.transportType;
            defibrillator.visualReference       = req.body.visualReference;
            defibrillator.floor                 = req.body.floor;
            defibrillator.temporalAccessibility = req.body.temporalAccessibility;
            defibrillator.recovery              = req.body.recovery;
            defibrillator.signage               = req.body.signage;
            defibrillator.brand                 = req.body.brand;
            defibrillator.notes                 = req.body.notes;

            // If a new photo is provided
            if (req.file) {

                // Delete the old one
                clearImage(defibrillator.imageUrl);

                // Set the coordinates of the new one
                defibrillator.imageCoordinates = req.body.imageCoordinates;

                // Set the new one
                defibrillator.imageUrl = req.file.path.replace("\\", "/");

            }

            // Update the defibrillator
            return defibrillator.save();

        })
        .then(result => {

            // Send a successful response
            res.status(200).json({ message: "Defibrillator updated.", defibrillator: result })

        })
        .catch(err => {

            console.error(err);

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Call the next middleware
            next(err);

        });

};


/* Deletes a defibrillator from the database. The entry will not be removed, it will just be marked for deletion. */
exports.deleteDefibrillator = (req, res, next) => {

    // Extract the id form the request
    const id = req.params.defibrillatorId;

    // Find the defibrillator by id
    Defibrillator.findById(id)
        .then(defibrillator => {

            // If no defibrillator is found, throw a 404 error
            if (!defibrillator) {
                const error      = new Error("Could not find defibrillator.");
                error.statusCode = 404;
                throw error;
            }

            // If the user who has mapped the defibrillator is not the calling user, throw a 401 error
            if (defibrillator.user.toString() !== req.userId) {
                const error      = new Error("Not authorized.");
                error.statusCode = 401;
                throw error;
            }

            // Mark the entry for deletion
            defibrillator.markedForDeletion = true;

            // Update the defibrillator
            return defibrillator.save();

        })
        .then(() => {

            // Send a success response
            res.status(200).json({ message: "Defibrillator successfully deleted." })

        })
        .catch(err => {

            console.error(err);

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Call the next middleware
            next(err);

        });

};


/* Utility function for deleting an image from the local storage */
const clearImage = filePath => {

    // Compute the complete path
    filePath = path.join(__dirname, "..", filePath);

    // Remove the image
    fs.unlink(filePath, err => {console.error(err)});

};