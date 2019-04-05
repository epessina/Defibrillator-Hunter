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

    constructor(_id, timeStamp, lang, position, accuracy, locationCategory, transportType, visualReference, floor,
                temporalAccessibility, recovery, signage, brand, notes, presence, photo) {

        this._id                   = _id;
        this.timeStamp             = timeStamp;
        this.lang                  = lang;
        this.position              = position;
        this.accuracy              = accuracy;
        this.locationCategory      = locationCategory;
        this.transportType         = transportType;
        this.visualReference       = visualReference;
        this.floor                 = floor;
        this.temporalAccessibility = temporalAccessibility;
        this.recovery              = recovery;
        this.signage               = signage;
        this.brand                 = brand;
        this.notes                 = notes;
        this.presence              = presence;

    }

    addAttachment(photo) {

        this._attachments = {
            "image": {
                content_type: "image/jpeg",
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

                        showAlert("messages.contributionSuccess");
                        this.showDefibrillator();

                    }

                });

            }

            // If there is no error, as soon as the connection is available, replicate the document in the remote db
            else {

                // if (networkState === Connection.NONE || navigator.onLine === false)
                //     showAlert("messages.contributionSuccessNoInternet");
                // else
                //     showAlert("messages.contributionSuccess");

                showAlert("messages.contributionSuccess");
                this.showDefibrillator();

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


    showDefibrillator() {

        let marker = L.marker(
            this.position,
            {
                icon     : defibrillatorIcon,
                draggable: false
            }
        );
        marker._id = this._id;

        let photoSrc = "";

        if (isApp)
            photoSrc = HOSTED_POINTS_DB + "/" + this._id + "/image";
        else
            photoSrc = REMOTE_POINTS_DB + "/" + this._id + "/image";

        let popup =
                "<p><b>id:</b> " + this._id + "</p>" +
                "<img style='width: 200px; height: 200px' " +
                "src='" + photoSrc + "' " +
                "alt=''>" +
                "<br>" +
                "<button id='" + this._id + "' " +
                "        class='btn-popup' " +
                "        onclick='deleteDefibrillator(this.id)'>" +
                "Cancel" +
                "</button>";

        marker.bindPopup(popup);

        markers.push(marker);

        marker.addTo(map);

        return marker;

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

