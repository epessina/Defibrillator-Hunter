"use strict";

const mongoose = require("mongoose"), // Import the module for the db handling
      Schema   = mongoose.Schema;     // Save the "schema" object

// Create the object that models a single caller key
const keySchema = new Schema({
    key: { type: String, required: true },
    app: { type: String, required: true }
}, { timestamps: false });

// Export the model
module.exports = mongoose.model("Key", keySchema);