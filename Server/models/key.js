"use strict";

const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

const keySchema = new Schema({
    key: {
        type: String,
        required: true
    },
    app: {
        type: String,
        required: true
    }
}, { timestamps: false });

module.exports = mongoose.model("Key", keySchema);