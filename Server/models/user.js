"use strict";

const mongoose = require("mongoose"),  // Import the module for the db handling
      Schema   = mongoose.Schema;      // Save the "schema" object

// Create the object that models a single user
const userSchema = new Schema({
    email                      : { type: String, unique: true },
    password                   : String,
    name                       : String,
    age                        : String,
    gender                     : String,
    occupation                 : String,
    isRescuer                  : Boolean,
    isConfirmed                : { type: Boolean, default: false },
    defibrillators             : [{ type: Schema.Types.ObjectId, ref: "Defibrillator" }],
    imageUrl                   : String,
    confirmEmailToken          : String,
    confirmEmailTokenExpiration: Date,
    resetPwToken               : String,
    resetPwTokenExpiration     : Date
}, { timestamps: true });

// Export the model
module.exports = mongoose.model("User", userSchema);