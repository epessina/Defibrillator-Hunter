"use strict";

const fs   = require("fs"),
      path = require("path");

const Defibrillator        = require("../models/defibrillator"),
      User                 = require("../models/user"),
      { validationResult } = require("express-validator/check");


exports.getDefibrillators = (req, res, next) => {

    Defibrillator.find({ user: req.userId, markedForDeletion: false })
        .then(defibrillators => {
            res.status(200)
                .json({
                    message       : "Fetched data successfully",
                    defibrillators: defibrillators
                })
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


exports.getDefibrillator = (req, res, next) => {

    const id = req.params.defibrillatorId;

    Defibrillator.findById(id)
        .then(defibrillator => {
            if (!defibrillator) {
                const error      = new Error("Could not find defibrillator.");
                error.statusCode = 404;
                throw error;
            }

            if (defibrillator.user.toString() !== req.userId) {
                const error      = new Error("Not authorized.");
                error.statusCode = 401;
                throw error;
            }

            res.status(200).json({
                message      : "Defibrillator found!",
                defibrillator: defibrillator
            })
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


exports.postDefibrillator = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error      = new Error("Defibrillator validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    const coordinates = JSON.parse(req.body.coordinates);

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

    let imageUrl;

    if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
    } else {
        const error      = new Error("Defibrillator validation failed. Entered data is incorrect.");
        error.errors     = [{
            location: "body",
            msg     : "You must provide a photo",
            param   : "imageUrl",
            value   : ""
        }];
        error.statusCode = 422;
        throw error;
    }

    let creator;

    console.log(req.body);

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
        imageUrl             : imageUrl,
        imageCoordinates     : req.body.imageCoordinates
    });

    defibrillator
        .save()
        .then(() => {
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.defibrillators.push(defibrillator);
            return user.save();
        })
        .then(() => {
            res.status(201).json({
                message      : "Defibrillator created",
                defibrillator: defibrillator,
                userId       : creator._id
            });
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


exports.updateDefibrillator = (req, res, next) => {

    const id = req.params.defibrillatorId;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error      = new Error("Defibrillator validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    Defibrillator.findById(id)
        .then(defibrillator => {
            if (!defibrillator) {
                const error      = new Error("Could not find defibrillator.");
                error.statusCode = 404;
                throw error;
            }

            if (defibrillator.user.toString() !== req.userId) {
                const error      = new Error("Not authorized.");
                error.statusCode = 401;
                throw error;
            }

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

            if (req.file) {
                clearImage(defibrillator.imageUrl);
                defibrillator.imageCoordinates = req.body.imageCoordinates;
                defibrillator.imageUrl         = req.file.path.replace("\\", "/");
            }

            return defibrillator.save();
        })
        .then(result => {
            console.log(result);
            res.status(200)
                .json({
                    message      : "Defibrillator updated.",
                    defibrillator: result
                })
        })
        .catch(err => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }
            next(err);
        });
};


exports.deleteDefibrillator = (req, res, next) => {

    const id = req.params.defibrillatorId;

    Defibrillator.findById(id)
        .then(defibrillator => {
            if (!defibrillator) {
                const error      = new Error("Could not find defibrillator.");
                error.statusCode = 404;
                throw error;
            }

            if (defibrillator.user.toString() !== req.userId) {
                const error      = new Error("Not authorized.");
                error.statusCode = 401;
                throw error;
            }

            defibrillator.markedForDeletion = true;
            return defibrillator.save();
        })
        .then(() => res.status(200).json({ message: "Defibrillator successfully deleted." }))
        .catch(err => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }
            next(err);
        });
};


const clearImage = filePath => {
    filePath = path.join(__dirname, "..", filePath);
    fs.unlink(filePath, err => {
        console.error(err)
    });
};