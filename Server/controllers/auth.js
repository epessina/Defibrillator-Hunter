"use strict";

const crypto = require("crypto");

const User                 = require("../models/user"),
      { validationResult } = require("express-validator/check"),
      bcrypt               = require("bcryptjs"),
      jwt                  = require("jsonwebtoken"),
      nodemailer           = require("nodemailer"),
      sendgridTransport    = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
    sendgridTransport({ auth: { api_key: process.env.NODEMAILER_KEY } }));

transporter.verify(err => { if (err) console.error(`Error setting up the transporter: ${err}`) });


exports.check = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        if (errors.array()[0].msg === "This email address is already registered.")
            res.status(409).json({
                message: "This email address is already registered."
            });
        else
            res.status(422).json({
                message: "Invalid email and/or password.",
                errors : errors.array()
            });
    } else {
        res.status(200).json({
            message: "Valid email and password."
        });
    }

};

exports.signup = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        if (errors.array()[0].msg === "This email address is already registered.")
            res.status(409).json({
                message: "This email address is already registered."
            });
        else
            res.status(422).json({
                message: "Registration validation failed. Entered data is incorrect.",
                errors : errors.array()
            });
    }

    const email      = req.body.email,
          password   = req.body.password,
          name       = req.body.name,
          age        = req.body.age,
          gender     = req.body.gender,
          occupation = req.body.occupation,
          isRescuer  = req.body.isRescuer;

    let newUser = null;

    bcrypt.hash(password, 12)
        .then(hashPw => {

            const token = crypto.randomBytes(32).toString("hex");

            const user = new User({
                email                      : email,
                password                   : hashPw,
                name                       : name,
                age                        : age,
                gender                     : gender,
                occupation                 : occupation,
                isRescuer                  : isRescuer,
                imageUrl                   : "",
                confirmEmailToken          : token,
                confirmEmailTokenExpiration: Date.now() + 86400000      // 1 day
            });

            return user.save();
        })
        .then(user => {

            newUser = user;

            return transporter.sendMail({
                to     : email,
                from   : "support@defibrillator-hunter.com",
                subject: "Welcome to DefibrillatorHunter! Confirm your email.",
                text   : `http:\/\/${req.headers.host}\/auth\/confirmation\/${user.confirmEmailToken}`
            });
        })
        .then(() => {
            res.status(201).json({
                message: "User created.",
                userId : newUser._id
            });
        })
        .catch(err => {
            console.error(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            if (!newUser) {
                next(err);
                return;
            }

            console.log("User already created. Rolling back...");

            User.findByIdAndRemove(newUser._id)
                .then(() => {
                    res.status(500).json({
                        message: "Something went wrong on the server. Rolling back..."
                    });
                })
                .catch(err => {
                    console.log(err);
                    if (!err.statusCode) {
                        err.statusCode = 500;
                        err.errors     = ["Something went wrong on the server."];
                    }
                    next(err);
                });
        })
};

exports.confirmMail = (req, res, next) => {

    const token = req.params.token;

    User.findOne({ confirmEmailToken: token })
        .then(user => {

            if (!user) {
                const error      = new Error("User not found");
                error.statusCode = 404;
                throw error;
            }

            if (!(new Date(user.confirmEmailTokenExpiration).getTime() > Date.now())) {
                const error      = new Error("Token expired");
                error.statusCode = 400;
                throw error;
            }

            if (user.isConfirmed) {
                const error      = new Error("User already verified");
                error.statusCode = 409;
                throw error;
            }

            user.isConfirmed                 = true;
            user.confirmEmailToken           = undefined;
            user.confirmEmailTokenExpiration = undefined;

            return user.save();
        })
        .then(() => res.render("confirm-mail", { errorMessage: null }))
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server"];
            }

            const errorMessage = `Error! ${err.message}`;
            res.render("confirm-mail", { errorMessage: errorMessage });
        });

};

exports.resendConfirmationEmail = (req, res, next) => {

    const email = req.body.email;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error      = new Error("Data validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    let token;

    User.findOne({ email: email })
        .then(user => {

            if (!user) {
                const error      = new Error("User not found.");
                error.statusCode = 404;
                throw error;
            }

            if (user.isConfirmed) {
                const error      = new Error("User already verified.");
                error.statusCode = 409;
                throw error;
            }

            token = crypto.randomBytes(32).toString("hex");

            user.confirmEmailToken           = token;
            user.confirmEmailTokenExpiration = Date.now() + 86400000;

            return user.save();
        })
        .then(() => {
            return transporter.sendMail({
                to     : email,
                from   : "support@defibrillator-hunter.com",
                subject: "Welcome to DefibrillatorHunter! Confirm your email.",
                text   : `http:\/\/${req.headers.host}\/auth\/confirmation\/${token}`
            });
        })
        .then(() => res.status(201).json({ message: "Email sent." }))
        .catch(err => {
            console.error(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }
            next(err);
        })

};

exports.login = (req, res, next) => {

    const email    = req.body.email,
          password = req.body.password;

    let loadedUser;

    User.findOne({ email: email })
        .then(user => {

            if (!user) {
                const error      = new Error("Invalid credentials.");
                error.statusCode = 401;
                throw error;
            }

            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {

            if (!isEqual) {
                const error      = new Error("Invalid credentials.");
                error.statusCode = 401;
                throw error;
            }

            if (!loadedUser.isConfirmed) {
                const error      = new Error("Mail not verified.");
                error.statusCode = 460;
                throw error
            }

            const token = jwt.sign({
                    userId: loadedUser._id.toString(),
                    email : loadedUser.email
                }, process.env.JWT_PRIVATE_KEY, { expiresIn: "1d" }
            );

            res.status(200).json({
                token : token,
                userId: loadedUser._id.toString()
            });
        })
        .catch(err => {
            console.error(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }
            next(err);
        })

};

exports.resetPw = (req, res, next) => {

    const email = req.body.email;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error      = new Error("Data validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    let token;

    User.findOne({ email: email })
        .then(user => {

            if (!user) {
                const error      = new Error("User not found.");
                error.statusCode = 404;
                throw error;
            }

            token = crypto.randomBytes(32).toString("hex");

            user.resetPwToken           = token;
            user.resetPwTokenExpiration = Date.now() + 3600000;     // 1h

            return user.save();
        })
        .then(() => {
            return transporter.sendMail({
                to     : email,
                from   : "support@defibrillator-hunter.com",
                subject: "Password reset",
                text   : `http:\/\/${req.headers.host}\/auth\/new-password\/${token}`
            });
        })
        .then(() => res.status(201).json({ message: "Email sent." }))
        .catch(err => {
            console.error(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }
            next(err);
        })

};

exports.getNewPassword = (req, res, next) => {

    const token = req.params.token;

    User.findOne({ resetPwToken: token })
        .then(user => {

            if (!user) {
                const error      = new Error("User not found");
                error.statusCode = 404;
                throw error;
            }

            if (!(new Date(user.resetPwTokenExpiration).getTime() > Date.now())) {
                const error      = new Error("Token expired");
                error.statusCode = 400;
                throw error;
            }

            res.render("new-password", {
                token       : token,
                email       : user.email,
                errorMessage: null
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server"];
            }

            const errorMessage = `Error! ${err.message}`;
            res.render("new-password", { errorMessage: errorMessage });
        });

};

exports.postNewPassword = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error      = new Error("Password validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    const password = req.body.password,
          email    = req.body.email,
          token    = req.body.token;

    let loadedUser;

    User.findOne({
        resetPwToken: token,
        email       : email
    })
        .then(user => {

            if (!user) {
                const error      = new Error("Could not find the user.");
                error.statusCode = 404;
                throw error;
            }

            if (!(new Date(user.resetPwTokenExpiration).getTime() > Date.now())) {
                const error      = new Error("Token expired");
                error.statusCode = 400;
                throw error;
            }

            loadedUser = user;
            return bcrypt.hash(password, 12);
        })
        .then(hashPw => {
            loadedUser.password               = hashPw;
            loadedUser.resetPwToken           = undefined;
            loadedUser.resetPwTokenExpiration = undefined;

            return loadedUser.save();
        })
        .then(() => {
            res.status(201).json({ message: "Password reset successful." });
        })
        .catch(err => {
            console.error(err);
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }
            next(err);
        })

};