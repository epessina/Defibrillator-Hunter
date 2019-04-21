"use strict";

/**
 * _id: String,
 * creationDate: String,
 * lastModified: String
 * position: [Float, Float],
 * accuracy: Float,
 * locationCategory: (commercialActivity | residentialBuilding | ...),
 * transportType: String
 * visualReference: String,
 * floor: Int,
 * temporalAccessibility: (h24 | partTime | notSpecified),
 * recovery: (immediate | fast | average | slow | verySlow),
 * signage: (great | visible | hardToSee | absent),
 * brand: String,
 * notes: String,
 * presence: Boolean,
 *  _attachments: {
 *      "image": {
 *          content_type: "image\/jpeg",
 *          data: Data
 *      }
 *  }
 *
 */

const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

const defibrillatorSchema = new Schema({
    user                 : Object,
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
    imageUrl             : String
}, { timestamps: true });

module.exports = mongoose.model("Defibrillator", defibrillatorSchema);