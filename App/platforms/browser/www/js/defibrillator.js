"use strict";

/**
 * uuid: String
 * userID: String
 * timestamp: String
 * lang: String
 * position: [Float, Float]
 * location: {
 *     type: (INDOOR | OUTDOOR),
 *     subtype: (COMMERCIAL_ACTIVITY | COMPANY | RESIDENTIAL_BUILDING | PUBLIC_PLACE | SPORT_FACILITY |
 *               TRANSPORT_STATION | OTHER),
 *     otherSpecification: String,
 *     floor: Int,
 *     notes: String
 * },
 * temporalAccessibility: {
 *     days: (ALWAYS | WEEKDAYS | WEEKEND | NEVER),
 *     time: (ALWAYS | DAY_TIME | NIGHT_TIME | NEVER),
 *     details: {
 *         monday: {
 *             from: String
 *             to: String
 *         },
 *         ...
 *     }
 * },
 * spatialAccessibility: {
 *     score: Int,
 *     description: String
 * },
 * ownership: String,
 * contactPerson: Boolean,
 * otherNotes: String,
 *  _attachments: {
 *      "image": {
 *          content_type: "image\/jpeg",
 *          data: Data
 *      }
 *  }
 *
 */

class Defibrillator {

    constructor(userID, lang, position, location, floor, temporalAccessibility, spatialAccessibility, ownership,
                contactPerson, notes, photo) {

        this._id                   = Defibrillator.generateUUID();
        this.userID                = userID;
        this.timeStamp             = new Date().toISOString();
        this.lang                  = lang;
        this.position              = position;
        this.location              = location;
        this.floor                 = floor;
        this.temporalAccessibility = temporalAccessibility;
        this.spatialAccessibility  = spatialAccessibility;
        this.ownership             = ownership;
        this.contactPerson         = contactPerson;
        this.notes                 = notes;
        this._attachments          = {
            "image": {
                content_type: "image\/jpeg",
                data        : photo
            }
        }

    }

    // Uses the cryptographically secure random number generator
    static generateUUID() {

        let array = new Uint32Array(8);
        let uuid  = '';

        window.crypto.getRandomValues(array);

        for (let i = 0; i < array.length; i++) {
            uuid += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4)
        }

        return uuid
    }

}

