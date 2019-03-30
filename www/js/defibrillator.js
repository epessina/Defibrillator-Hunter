"use strict";

/**
 * _id: String,
 * timestamp: String,
 * lang: String,
 * position: [Float, Float],
 * accuracy: Float,
 * locationCategory: (commercialActivity | residentialBuilding | ...),
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

class Defibrillator {

    constructor() {

        this._id                   = Defibrillator.generateUID();
        this.timeStamp             = new Date().toISOString();
        this.lang                  = ln.language;
        this.position              = currLatLong;
        this.accuracy              = currAccuracy;
        this.locationCategory      = locationCategory;
        this.visualReference       = visualReference;
        this.floor                 = floor;
        this.temporalAccessibility = temporalAccessibility;
        this.recovery              = recovery;
        this.signage               = signage;
        this.brand                 = brand;
        this.notes                 = notes;
        this.presence              = presence;
        this._attachments          = {
            "image": {
                content_type: "image\/jpeg",
                data        : photo
            }
        }

    }


    insertDefibrillator() {

        // Insert the data in the local database
        localDb.put(this, err => {

            // If an error occurs, insert the data in the remote database
            if (err) {

                showAlert("messages.localStorageError");

                pointsDB.put(this, err => {

                    if (err) {

                        showAlert("messages.generalError");
                        console.log(err);

                    } else {

                        // userDefibrillators.push(this);
                        // displayNewDefibrillator(this);
                        showAlert("messages.contributionSuccess");

                    }

                });

            }

            // If there is no error, as soon as the connection is available, replicate the document in the remote db
            else {

                // userDefibrillators.push(this);
                // displayNewDefibrillator(this);

                // if (networkState === Connection.NONE || navigator.onLine === false)
                //     showAlert("messages.contributionSuccessNoInternet");
                // else
                //     showAlert("messages.contributionSuccess");

                showAlert("messages.contributionSuccess");

                localDb.replicate
                    .to(pointsDB, {retry: true})
                    .on("complete", () => {

                        console.log("Replication success");

                        localDb.destroy().then(() => {
                            localDb = new PouchDB(LOCAL_DB);
                        });

                    })
                    .on("error", err => console.log("Replication error: " + err));
            }

        });

    }


    // Uses the cryptographically secure random number generator
    static generateUID() {

        let array = new Uint32Array(8);
        let uid   = '';

        window.crypto.getRandomValues(array);

        for (let i = 0; i < array.length; i++) {
            uid += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4)
        }

        return uid
    }

}

