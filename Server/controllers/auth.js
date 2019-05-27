"use strict";

const settings             = require("../settings"),
      User                 = require("../models/user"),
      { validationResult } = require("express-validator/check"),
      bcrypt               = require("bcryptjs"),
      jwt                  = require("jsonwebtoken"),
      nodemailer           = require("nodemailer"),
      sendgridTransport    = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: { api_key: settings.nodemailerKey }
    })
);


exports.check = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            message: "Invalid email and/or password.",
            errors : errors.array()
        });
    } else {
        res.status(202).json({
            message: "Valid email and password."
        });
    }

};

exports.signup = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error      = new Error("Registration validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    const email      = req.body.email,
          password   = req.body.password,
          name       = req.body.name,
          age        = req.body.age,
          occupation = req.body.occupation,
          isRescuer  = req.body.isRescuer;

    bcrypt.hash(password, 12)
        .then(hashPw => {

            const user = new User({
                email     : email,
                password  : hashPw,
                name      : name,
                age       : age,
                occupation: occupation,
                isRescuer : isRescuer
            });

            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: "User created.",
                userId : result._id
            });

            // return transporter.sendMail({
            //     to     : email,
            //     from   : "support@defibrillator-hunter.com",
            //     subject: "Welcome to DefibrillatorHunter! Confirm your email.",
            //     html   : "<a href=''></a>"
            // });
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

exports.login = (req, res, next) => {

    const email    = req.body.email,
          password = req.body.password;

    let loadedUser;

    User.findOne({ email: email })
        .then(user => {

            if (!user) {
                const error      = new Error("User not found.");
                error.statusCode = 401;
                throw error;
            }

            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {

            if (!isEqual) {
                const error      = new Error("Wrong password.");
                error.statusCode = 401;
                throw error;
            }

            const token = jwt.sign({
                    userId: loadedUser._id.toString(),
                    email : loadedUser.email
                }, settings.privateKey, { expiresIn: "1d" }
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