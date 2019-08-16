"use strict";

const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

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

module.exports = mongoose.model("Defibrillator", defibrillatorSchema);