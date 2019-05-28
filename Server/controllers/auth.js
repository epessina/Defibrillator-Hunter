"use strict";

const User                 = require("../models/user"),
      Defibrillator        = require("../models/defibrillator"),
      { validationResult } = require("express-validator/check"),
      bcrypt               = require("bcryptjs"),
      jwt                  = require("jsonwebtoken"),
      nodemailer           = require("nodemailer"),
      sendgridTransport    = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: { api_key: process.env.NODEMAILER_KEY }
    })
);


exports.getUser = (req, res, next) => {

    const id = req.params.userId;

    if (id !== req.userId) {
        const error      = new Error("Not authorized.");
        error.statusCode = 403;
        throw error;
    }

    let userInfo;

    User.findById(id)
        .then(user => {

            if (!user) {
                const error      = new Error("Could not find the user.");
                error.statusCode = 404;
                throw error;
            }

            userInfo = user;

            Defibrillator.countDocuments({ user: id, markedForDeletion: false })
                .then(count => {
                    res.status(200).json({
                        message: "User found.",
                        user   : {
                            email     : user.email,
                            name      : user.name,
                            age       : user.age,
                            gender    : user.gender,
                            occupation: user.occupation,
                            isRescuer : user.isRescuer,
                            defNumber : count
                        }
                    })
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
          gender     = req.body.gender,
          occupation = req.body.occupation,
          isRescuer  = req.body.isRescuer;

    bcrypt.hash(password, 12)
        .then(hashPw => {

            const user = new User({
                email     : email,
                password  : hashPw,
                name      : name,
                age       : age,
                gender    : gender,
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