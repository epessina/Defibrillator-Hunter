"use strict";

const express  = require("express"),
      { body } = require("express-validator/check");

const User = require("../models/user");

const authController = require("../controllers/auth"),
      checkCaller    = require("../middleware/check-caller");

const router = express.Router();

const validAge        = ["none", "less15", "16-20", "21-25", "26-30", "31-35", "36-40", "41-45", "46-50", "51-55", "56-60",
    "61-65", "66-70", "more70"];
const validGender     = ["none", "male", "female", "other"];
const validOccupation = ["none", "student", "employee", "freelancer", "unemployed", "retiree"];

const emailValidation = [
    body("email")
        .isEmail().withMessage("Please enter a valid email.")
        .normalizeEmail()
];

const emailPwValidation = [
    body("email")
        .isEmail().withMessage("Please enter a valid email.")
        .normalizeEmail()
        .custom(val => {
            return User.findOne({ email: val }).then(userDoc => {
                if (userDoc)
                    return Promise.reject("This email address is already registered.")
            })
        }),
    body("password")
        .trim()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long and must contain at least one number")
        .custom(val => {
            if (!(/\d/.test(val)))
                throw new Error("Password must be at least 8 characters long and must contain at least one number");
            return true;
        }),
    body("confirmPassword")
        .trim()
        .custom((val, { req }) => {
            if (val !== req.body.password)
                throw new Error("Passwords don't match.");
            return true;
        })
];

const signupValidation = [
    body("email")
        .isEmail().withMessage("Please enter a valid email.")
        .normalizeEmail()
        .custom(val => {
            return User.findOne({ email: val }).then(userDoc => {
                if (userDoc)
                    return Promise.reject("This email address is already registered.")
            })
        }),
    body("password")
        .trim()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long and must contain at least one number")
        .custom(val => {
            if (!(/\d/.test(val)))
                throw new Error("Password must be at least 8 characters long and must contain at least one number");
            return true;
        }),
    body("confirmPassword")
        .trim()
        .custom((val, { req }) => {
            if (val !== req.body.password)
                throw new Error("Passwords don't match.");
            return true;
        }),
    body("name")
        .not().isEmpty().withMessage("You must provide a name.")
        .trim()
        .escape(),
    body("age")
        .isIn(validAge).withMessage("Invalid age value."),
    body("gender")
        .isIn(validGender).withMessage("Invalid gender value."),
    body("occupation")
        .isIn(validOccupation).withMessage("Invalid occupation value."),
    body("isRescuer")
        .isBoolean().withMessage("Invalid rescuer value.")
];

const resendConfirmationEmailValidation = [
    body("email")
        .isEmail().withMessage("Please enter a valid email.")
        .normalizeEmail()
];

const resetPwValidation = [
    body("password")
        .trim()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long and must contain at least one number")
        .custom(val => {
            if (!(/\d/.test(val)))
                throw new Error("Password must be at least 8 characters long and must contain at least one number");
            return true;
        }),
    body("confirmPassword")
        .trim()
        .custom((val, { req }) => {
            if (val !== req.body.password)
                throw new Error("Passwords don't match.");
            return true;
        })
];


// PUT /auth/check
router.put("/check", checkCaller, emailPwValidation, authController.check);

// PUT /auth/signup
router.put("/signup", checkCaller, signupValidation, authController.signup);

// GET /auth/confirmation/:token
router.get("/confirmation/:token", authController.confirmMail);

// POST /auth/confirmation/resend
router.post("/confirmation/resend", checkCaller, resendConfirmationEmailValidation, authController.resendConfirmationEmail);

// POST /auth/login
router.post("/login", checkCaller, authController.login);

// POST /auth/reset-password
router.post("/reset-password", checkCaller, emailValidation, authController.resetPw);

// GET /auth/new-password:token
router.get("/new-password/:token", authController.getNewPassword);

// POST /auth/new-password
router.post("/new-password", resetPwValidation, authController.postNewPassword);


module.exports = router;