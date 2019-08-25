"use strict";

const express  = require("express"),                 // Express module
      { body } = require("express-validator/check"); // Module for validating the data

const defibrillatorController = require("../controllers/defibrillator"), // Controller module
      checkCaller             = require("../middleware/check-caller"),   // Caller checking middleware
      isAuth                  = require("../middleware/is-auth");        // Authorization checking middleware

// Save all the valid values for the fields
const validLocationCategories = ["commercialActivity", "residentialBuilding", "publicPlace", "sportsCentre",
    "transportStation", "educationalEstablishment", "schoolGym", "drugstore", "street", "medicalPracticeClinic",
    "churchOratorio", "shelter", "nursingHomeHospice", "other"];
const validTransportTypes     = ["", "metro", "airport", "trainStation", "busStation", "other"];
const validPresence           = ["yes", "no"];
const validTempAccessibility  = ["h24", "partTime", "notSpecified"];
const validRecovery           = ["", "immediate", "fast", "average", "slow", "verySlow"];
const validSignage            = ["", "great", "visible", "hardToSee", "absent"];

// Validation for the data sent with a post request
const postValidation = [
    body("coordinates")
        .not().isEmpty().withMessage("You must specify the coordinates of the defibrillator"),
    body("presence")
        .not().isEmpty().withMessage("You must specify if the defibrillator is present.")
        .isIn(validPresence).withMessage("Invalid presence value."),
    body("locationCategory")
        .not().isEmpty().withMessage("You must specify the location category.")
        .isIn(validLocationCategories).withMessage("Invalid location category value."),
    body("transportType")
        .isIn(validTransportTypes).withMessage("Invalid transport type value."),
    body("visualReference")
        .trim()
        .escape(),
    body("floor")
        .not().isEmpty().withMessage("You must specify the floor.")
        .isInt({ gt: -5, lt: 11 }).withMessage("Invalid floor value."),
    body("temporalAccessibility")
        .not().isEmpty().withMessage("You must specify the temporal accessibility.")
        .isIn(validTempAccessibility).withMessage("Invalid temporal accessibility value."),
    body("recovery")
        .isIn(validRecovery).withMessage("Invalid recovery value."),
    body("signage")
        .isIn(validSignage).withMessage("Invalid signage value."),
    body("brand")
        .trim()
        .escape(),
    body("notes")
        .trim()
        .escape()
];

// Validation for the data sent with a put request
const putValidation = [
    body("presence")
        .not().isEmpty().withMessage("You must specify if the defibrillator is present.")
        .isIn(validPresence).withMessage("Invalid presence value."),
    body("locationCategory")
        .not().isEmpty().withMessage("You must specify the location category.")
        .isIn(validLocationCategories).withMessage("Invalid location category value."),
    body("transportType")
        .isIn(validTransportTypes).withMessage("Invalid transport type value."),
    body("visualReference")
        .trim()
        .escape(),
    body("floor")
        .not().isEmpty().withMessage("You must specify the floor.")
        .isInt({ gt: -5, lt: 11 }).withMessage("Invalid floor value."),
    body("temporalAccessibility")
        .not().isEmpty().withMessage("You must specify the temporal accessibility.")
        .isIn(validTempAccessibility).withMessage("Invalid temporal accessibility value."),
    body("recovery")
        .isIn(validRecovery).withMessage("Invalid recovery value."),
    body("signage")
        .isIn(validSignage).withMessage("Invalid signage value."),
    body("brand")
        .trim()
        .escape(),
    body("notes")
        .trim()
        .escape()
];


// Create a router
const router = express.Router();


// GET /defibrillator/get-all
router.get("/get-all", checkCaller, isAuth, defibrillatorController.getDefibrillators);

// GET /defibrillator/user/:userId
router.get("/user/:userId", checkCaller, isAuth, defibrillatorController.getUserDefibrillators);

// GET /defibrillator/:defibrillatorId
router.get("/:defibrillatorId", checkCaller, isAuth, defibrillatorController.getDefibrillator);

// POST /defibrillator/post
router.post("/post", checkCaller, isAuth, postValidation, defibrillatorController.postDefibrillator);

// PUT /defibrillator/:defibrillatorId
router.put("/:defibrillatorId", checkCaller, isAuth, putValidation, defibrillatorController.updateDefibrillator);

// DELETE /defibrillator/:defibrillatorId
router.delete("/:defibrillatorId", checkCaller, isAuth, defibrillatorController.deleteDefibrillator);


// Export the routes
module.exports = router;