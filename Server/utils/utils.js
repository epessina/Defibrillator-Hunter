"use strict";

// Built in modules for path manipulation
const fs   = require("fs"),
      path = require("path");

const utils = {

    /** Points to assign to the user for each new defibrillator. */
    newDefibrillatorPoints: 10,

    /** Points to assign to the user for each optional request he adds.  */
    optionalRequestPoints: 1,


    /**
     * Deletes an image form the local storage.
     *
     * @param {string} fileName - The name of the file.
     */
    clearImage: fileName => {

        // Compute the complete path
        const filePath = path.join(__dirname, "..", fileName);

        // Remove the image
        fs.unlink(filePath, err => {console.error(err)});

    },

};


module.exports = utils;