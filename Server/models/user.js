"use strict";

/**
 * _id: String,
 * creationDate: String,
 * lastModified: String,
 * email: String,
 * password: String,
 * name: String,
 * age: String,
 * gender: String,
 * occupation: String,
 * isRescuer: Boolean,
 * status: String,
 * defibrillators: [ObjectId]
 */

const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

const userSchema = new Schema({
    email                      : {
        type  : String,
        unique: true
    },
    password                   : String,
    name                       : String,
    age                        : String,
    gender                     : String,
    occupation                 : String,
    isRescuer                  : Boolean,
    isConfirmed                : {
        type   : Boolean,
        default: false
    },
    defibrillators             : [{
        type: Schema.Types.ObjectId,
        ref : "Defibrillator"
    }],
    imageUrl                   : String,
    confirmEmailToken          : String,
    confirmEmailTokenExpiration: Date,
    resetPwToken               : String,
    resetPwTokenExpiration     : Date
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);