"use strict";

const mongoose = require("mongoose"),  // Import the module for the db handling
      Schema   = mongoose.Schema;      // Save the "schema" object

// Create the object that models a single defibrillator
const defibrillatorSchema = new Schema({
    user                 : { type: Schema.Types.ObjectId, ref : "User" },
    markedForDeletion    : { type   : Boolean, default: false },
    checked              : { type   : Boolean, default: false },
    coordinates          : [Number],
    accuracy             : Number,
    presence             : String,
    locationCategory     : String,
    transportType        : String,
    visualReference      : String,
    floor                : Number,
    temporalAccessibility: String,
    recovery             : String,
    signage              : String,
    brand                : String,
    notes                : String,
    imageUrl             : String,
    imageCoordinates     : String
}, { timestamps: true });

// Export the model
module.exports = mongoose.model("Defibrillator", defibrillatorSchema);