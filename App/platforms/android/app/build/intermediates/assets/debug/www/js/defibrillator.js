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

class Defibrillator {

    constructor(_id, creationDate, lastModified, position, accuracy, locationCategory, transportType, visualReference,
                floor, temporalAccessibility, recovery, signage, brand, notes, presence, hasPhoto) {

        this._id                   = _id;
        this.creationDate          = creationDate;
        this.lastModified          = lastModified;
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
        this.hasPhoto              = hasPhoto;
    }


    addAttachment(photo) {

        this._attachments = {
            "image": {
                content_type: "image/jpeg",
                data        : photo
            }
        }

    }


    insert() {

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
                        this.show();

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
                this.show();

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


    show() {

        let marker = L.marker(
            this.position, {
                icon     : defibrillatorIcon,
                draggable: false
            }
        );
        marker._id = this._id;

        marker.on("click", () => {

            this.showInfo();
            $("#defibrillator-info").show();


        });

        // let photoSrc = "";
        //
        // if (isApp)
        //     photoSrc = HOSTED_POINTS_DB + "/" + this._id + "/image";
        // else
        //     photoSrc = REMOTE_POINTS_DB + "/" + this._id + "/image";
        //
        // let popup =
        //         "<p><b>id:</b> " + this._id + "</p>" +
        //         "<img style='width: 200px; height: 200px' " +
        //         "src='" + photoSrc + "' " +
        //         "alt=''>" +
        //         "<br>" +
        //         "<button id='" + this._id + "' " +
        //         "        class='btn-popup' " +
        //         "        onclick='deleteDefibrillator(this.id)'>" +
        //         "Cancel" +
        //         "</button>";
        //
        // marker.bindPopup(popup);

        markers.push(marker);

        marker.addTo(map);

        return marker;

    }


    // ToDo format date and coordinates
    showInfo() {

        $("#info-edit").unbind("click").click(() => openInsert(this));

        $("#info-id .info-content").html(this._id);

        $("#info-creation-date .info-content").html(this.creationDate);

        $("#info-last-modified .info-content").html(this.lastModified);

        $("#info-coordinates .info-content").html(Defibrillator.generateInfo("position", this.position));

        $("#info-accuracy .info-content").html(this.accuracy);

        $("#info-presence .info-content").html(Defibrillator.generateInfo("presence", this.presence));

        $("#info-category .info-content").html(
            Defibrillator.generateInfo("locationCategory", this.locationCategory, this.transportType));

        $("#info-visual-reference .info-content").html(
            Defibrillator.generateInfo("reference", this.visualReference));

        $("#info-floor .info-content").html(Defibrillator.generateInfo("floor", this.floor));

        $("#info-temporal-accessibility .info-content").html(
            Defibrillator.generateInfo("tempAccessibility", this.temporalAccessibility));

        $("#info-recovery .info-content").html(Defibrillator.generateInfo("recovery", this.recovery));

        $("#info-signage .info-content").html(Defibrillator.generateInfo("signage", this.signage));

        $("#info-brand .info-content").html(Defibrillator.generateInfo("brand", this.brand));

        $("#info-notes .info-content").html(Defibrillator.generateInfo("notes", this.notes));

        if (!this.hasPhoto) {
            $("#info-photo-preview").attr("src", "img/no-img-placeholder-200.png");
        } else {
            let photoSrc = REMOTE_POINTS_DB + "/" + this._id + "/image";

            if (isApp)
                photoSrc = HOSTED_POINTS_DB + "/" + this._id + "/image";

            $("#info-photo-preview").attr("src", photoSrc);
        }

        $("#info-btn-cancel").click(() => this.cancel());

    }


    edit() {

    }


    cancel() {

        // navigator.notification.confirm(
        //     i18n.t("messages.confirmCancellation"),
        //     onConfirm,
        //     "Defibrillator Hunter",
        //     [i18n.t("messages.yes"), i18n.t("messages.no")]
        // );
        //
        // function onConfirm(btnIndex) {
        //
        //     if (btnIndex === 1) {

        pointsDB.get(this._id)
            .then(doc => pointsDB.remove(doc))
            .then(() => {
                let newMarkers = [];

                markers.forEach(marker => {
                    if (marker._id === this._id)
                        map.removeLayer(marker);
                    else
                        newMarkers.push(marker);
                });

                markers = newMarkers;

                closeInfoPage();
            })
            .catch(err => {
                showAlert("messages.cancelError");
                console.log(err);
            })
    }


    static generateInfo(category, val, type = "") {

        if (val === "")
            return "-";

        if (category === "position")
            return val[0] + ", " + val[1];

        if (category === "locationCategory" && type !== "")
            return i18n.t("insert." + category + ".enum." + val) + " (" + type + ")";

        if (category === "reference" || category === "floor" || category === "brand" || category === "notes")
            return val;

        return i18n.t("insert." + category + ".enum." + val);

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

