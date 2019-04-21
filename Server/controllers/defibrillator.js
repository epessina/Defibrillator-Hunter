"use strict";


const Defibrillator        = require("../models/defibrillator"),
      { validationResult } = require("express-validator/check");


exports.getDefibrillators = (req, res, next) => {

    Defibrillator.find()
        .then(defibrillators => {
            res.status(200)
                .json({
                    message       : "Fetched data successfully",
                    defibrillators: defibrillators
                })
        })
        .catch(err => {
            console.log(err);
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
            res.status(200).json({
                message      : "Defibrillator found!",
                defibrillator: defibrillator
            })
        })
        .catch(err => {
            console.log(err);
        });

};


exports.postDefibrillator = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({
                message: "Defibrillator validation failed. Entered data is incorrect.",
                errors : errors.array()
            })
    }

    const coordinates = JSON.parse(req.body.coordinates);

    if (coordinates.length !== 2 || typeof coordinates[0] !== "number" || typeof coordinates[1] !== "number") {
        return res
            .status(422)
            .json({
                message: "Defibrillator validation failed. Entered data is incorrect.",
                errors : {
                    location: "body",
                    msg     : "Invalid coordinates value",
                    param   : "coordinates",
                    value   : coordinates
                }
            })
    }

    let imageUrl = "images/no-img-placeholder-200.png";

    if (req.file)
        imageUrl = req.file.path.replace("\\", "/");

    const defibrillator = new Defibrillator({
        user                 : { name: "Edoardo" },
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
        imageUrl             : imageUrl
    });

    defibrillator.save()
        .then(result => {
            res.status(201).json({
                message      : "Defibrillator created",
                defibrillator: result
            });
        })
        .catch(err => {
            console.log(err);
        });
};