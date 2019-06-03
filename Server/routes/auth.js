"use strict";

const express  = require("express"),
      { body } = require("express-validator/check");

const User = require("../models/user");

const authController = require("../controllers/auth"),
      isAuth         = require("../middleware/is-auth");

const router = express.Router();

const validAge        = ["none", "less15", "16-20", "21-25", "26-30", "31-35", "36-40", "41-45", "46-50", "51-55", "56-60",
    "61-65", "66-70", "more70"];
const validGender     = ["none", "male", "female", "other"];
const validOccupation = ["none", "student", "employee", "freelancer", "unemployed", "retiree"];

const emailPwValidation = [body("email")
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
        .not().isEmpty().withMessage("You must provide a name."),
    body("age")
        .isIn(validAge).withMessage("Invalid age value."),
    body("gender")
        .isIn(validGender).withMessage("Invalid gender value."),
    body("occupation")
        .isIn(validOccupation).withMessage("Invalid occupation value."),
    body("isRescuer")
        .isBoolean().withMessage("Invalid rescuer value.")
];

const changePwValidation = [
    body("oldPassword")
        .trim()
        .custom((val, { req }) => {
            if (val === req.body.newPassword)
                throw new Error("Old password equal to new password.");
            return true;
        }),
    body("newPassword")
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
            if (val !== req.body.newPassword)
                throw new Error("Passwords don't match.");
            return true;
        })
];

const updateProfileValidation = [
    body("name")
        .not().isEmpty().withMessage("You must provide a name."),
    body("age")
        .isIn(validAge).withMessage("Invalid age value."),
    body("gender")
        .isIn(validGender).withMessage("Invalid gender value."),
    body("occupation")
        .isIn(validOccupation).withMessage("Invalid occupation value."),
    body("isRescuer")
        .isBoolean().withMessage("Invalid rescuer value.")
];


// GET /auth/:userId
router.get("/:userId", isAuth, authController.getUser);

// PUT /auth/check
router.put("/check", emailPwValidation, authController.check);

// PUT /auth/signup
router.put("/signup", signupValidation, authController.signup);

// POST /auth/login
router.post("/login", authController.login);

// PUT /auth/:userId/change-password
router.put("/:userId/change-password", isAuth, changePwValidation, authController.changePassword);

// PUT /auth/:userId/update-profile
router.put("/:userId/update-profile", isAuth, updateProfileValidation, authController.updateProfile);

// PUT /auth/:userId/update-picture
router.put("/:userId/update-picture", isAuth, authController.updatePicture);


module.exports = router;