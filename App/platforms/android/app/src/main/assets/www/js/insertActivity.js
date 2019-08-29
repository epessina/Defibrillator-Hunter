"use strict";

/**
 *  Activity to insert a new defibrillator into the database. It also allows the user to modify an already mapped
 *  defibrillator.
 *
 * @author Edoardo Pessina
 */
class InsertActivity {

    /** @private */ static _instance;

    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link InsertActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        // Cache the screen
        this._screen = $("#page--insert");

        // Cache the photo thumbnail
        this._$photoThm = $("#photo-thm");

        // Save the the currently opened dialog and full dialog
        this._currOpenedDialog     = null;
        this._currOpenedFullDialog = null;


        // The id of the defibrillator to modify. It has a value only if the activity is open in "put" mode
        this._defId = null;

        // The name of the original photo of the defibrillator passed in "put" mode. Used to check if the photo has been modified
        this._oldPhoto = null;

        this._vals = {
            coordinates          : "",
            coordinatesAccuracy  : "",
            presence             : "",
            locationCategory     : "",
            transportType        : "",
            visualReference      : "",
            floor                : "",
            temporalAccessibility: "",
            recovery             : "",
            signage              : "",
            brand                : "",
            notes                : "",
            photo                : "",
            photoCoordinates     : "",
        };

        // Initialize the user interface
        this.initUI();

    }

    /**
     * Returns the current InsertActivity instance if any, otherwise creates it.
     *
     * @returns {InsertActivity} The activity instance.
     */
    static getInstance() {

        if (!InsertActivity._instance)
            InsertActivity._instance = new InsertActivity();

        return InsertActivity._instance;

    }


    /** Opens the activity. */
    open() {

        // Push the activity into the stack
        utils.pushStackActivity(this);

        // Show the screen
        this._screen.show();

        // If in "post" mode
        if (!this._defId) {

            // Save the geolocation data
            this._vals.coordinates         = MapActivity.getInstance().currLatLng;
            this._vals.coordinatesAccuracy = MapActivity.getInstance().currLatLngAccuracy;

            // If there isn't in the official db a defibrillator is already mapped in the area, alert the user
            if (!defibrillatorDB.some(d => utils.haversineDistance(d.lat, d.lon, this._vals.coordinates[0], this._vals.coordinates[1]) <= 50))
                utils.createAlert("", i18next.t("dialogs.insert.defNotInOfficialDb"), i18next.t("dialogs.btnOk"));

        }

    }

    /**
     * Opens the activity in "put" mode (modify a defibrillator)
     *
     * @param {object} def - The data of the defibrillator to modify
     */
    openPut(def) {

        // Save the defibrillator id
        this._defId = def._id;

        // Save the defibrillator data
        this._vals.presence              = def.presence;
        this._vals.locationCategory      = def.locationCategory;
        this._vals.transportType         = def.transportType;
        this._vals.visualReference       = def.visualReference;
        this._vals.floor                 = def.floor;
        this._vals.temporalAccessibility = def.temporalAccessibility;
        this._vals.recovery              = def.recovery;
        this._vals.signage               = def.signage;
        this._vals.brand                 = def.brand;
        this._vals.notes                 = def.notes;
        this._vals.photo                 = `${settings.serverUrl}/${def.imageUrl}`;

        // Save the old photo
        this._oldPhoto = this._vals.photo;

        // Set the main screen texts of the mandatory properties
        $("#presence-text").html(i18next.t("insert.presence.enum." + this._vals.presence));
        $("#location-text").html(i18next.t("insert.locationCategory.enum." + this._vals.locationCategory));
        $("#floor-text").html(this._vals.floor);
        $("#temporal-text").html(i18next.t("insert.temporalAccessibility.enum." + this._vals.temporalAccessibility));

        // Set the main screen texts of the optional properties
        if (this._vals.recovery !== "") $("#recovery-text").html(i18next.t("insert.recovery.enum." + this._vals.recovery));
        if (this._vals.signage !== "") $("#signage-text").html(i18next.t("insert.signage.enum." + this._vals.signage));
        if (this._vals.notes !== "") $("#notes-text").html(i18next.t("insert.notes.editText"));

        // Show the photo
        this._$photoThm.find("img").attr("src", this._vals.photo).show();

        // Hide the icon
        this._$photoThm.find("i").hide();

        // Open the activity
        this.open();

    }

    /** Closes the activity and resets the fields. */
    close() {

        // Pop the activity from the stack
        utils.popStackActivity();

        // Set the id and the old photo to null
        this._defId    = null;
        this._oldPhoto = null;

        // Hide the screen
        this._screen.scrollTop(0).hide();

        // Rest the currently opened dialogs
        this._currOpenedDialog     = null;
        this._currOpenedFullDialog = null;

        // Set all values to ""
        Object.keys(this._vals).forEach(v => this._vals[v] = "");

        // Reset all the main screen texts
        $("#presence-text").html(i18next.t("insert.presence.defaultText"));
        $("#location-text").html(i18next.t("insert.locationCategory.defaultText"));
        $("#floor-text").html(i18next.t("insert.floor.defaultText"));
        $("#temporal-text").html(i18next.t("insert.temporalAccessibility.defaultText"));
        $("#recovery-text").html(i18next.t("insert.recovery.defaultText"));
        $("#signage-text").html(i18next.t("insert.signage.defaultText"));
        $("#notes-text").html(i18next.t("insert.notes.defaultText"));

        // Hide the photo
        this._$photoThm.find("img").attr("src", "img/img-placeholder-200.png").hide();

        // Show the icon
        this._$photoThm.find("i").show();

    }

    /** Defines the behaviour of the back button for this activity */
    onBackPressed() {

        // If a dialog is currently opened
        if (this._currOpenedDialog) {

            // Close the dialog
            this.closeDialog(this._currOpenedDialog);

            // Return
            return;

        }

        // If a full dialog is currently opened
        if (this._currOpenedFullDialog) {

            // Close the full dialog
            this.closeFullscreenDialog(this._currOpenedFullDialog);

            // Return
            return;

        }


        // Ask for confirmation and then close the activity
        utils.createAlert(
            "",
            i18next.t("dialogs.insert.confirmClose"),
            i18next.t("dialogs.insert.btnKeepEditing"),
            null,
            i18next.t("dialogs.insert.btnDiscard"),
            () => { this.close() }
        );

    }


    /** Initialize the user interface. */
    initUI() {

        // If the user clicks the "close" button, ask for confirmation and then close tha activity
        $("#new-defibrillator-close").click(() => {

            utils.createAlert(
                "",
                i18next.t("dialogs.insert.confirmClose"),
                i18next.t("dialogs.insert.btnKeepEditing"),
                null,
                i18next.t("dialogs.insert.btnDiscard"),
                () => { this.close() }
            );

        });

        // When the user clicks on the "done" button, check the fields and add/update the defibrillator
        $("#new-defibrillator-done").click(() => {

            // If the user hasn't specified the presence, return
            if (this._vals.presence === "") {
                utils.logOrToast(i18next.t("messages.mandatoryPresence"), "long");
                return;
            }

            // If the user hasn't specified the location category, return
            if (this._vals.locationCategory === "") {
                utils.logOrToast(i18next.t("messages.mandatoryLocationCategory"), "long");
                return;
            }

            // If the user hasn't specified the floor, return
            if (this._vals.floor === "") {
                utils.logOrToast(i18next.t("messages.mandatoryFloor"), "long");
                return;
            }

            // If the user hasn't specified the temporal accessibility, return
            if (this._vals.temporalAccessibility === "") {
                utils.logOrToast(i18next.t("messages.mandatoryTempAccessibility"), "long");
                return;
            }

            // If the user hasn't inserted a photo, return
            if (this._vals.photo === "") {
                utils.logOrToast(i18next.t("messages.mandatoryPhoto"), "long");
                return;
            }

            // If the location category is not "transportStation", put the transport type to ""
            if (this._vals.locationCategory !== "transportStation") this._vals.transportType = "";

            // If the activity is in "post" mode, post
            if (!this._defId) this.post();

            // Else, put
            else this.put();

        });


        // Fired when the user clicks on the "presence" request
        $("#presence-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect;

            // If the user hasn't already specified the presence, select "Yes"
            if (this._vals.presence === "") toSelect = "yes";

            // Else, select the value already selected by the user
            else toSelect = this._vals.presence;

            // Change the selected option of the selector
            $("input[name='presence'][value='" + toSelect + "']").prop("checked", "true");

            // Open the dialog
            this.openDialog($("#dialog-presence"));

        });

        // Fired when the user clicks on "cancel"
        $("#presence-cancel").click(() => this.closeDialog($("#dialog-presence")));

        // Fired when the user clicks on "ok"
        $("#presence-ok").click(() => {

            // Save the value
            this._vals.presence = $("input[name='presence']:checked").val();

            // Set the text of the main page
            $("#presence-text").html(i18next.t("insert.presence.enum." + this._vals.presence));

            // Close the dialog
            this.closeDialog($("#dialog-presence"));

        });


        // Cache the selectors
        let $locationSelect      = $("#location-select"),
            $transportTypeSelect = $("#transport-type-select");

        // Fired when the user clicks on the "location category" request
        $("#location-category-request").click(() => {

            // If the selected location is "transportStation", show the transport type selector
            if (this._vals.locationCategory === "transportStation") $("#transport-type-wrapper").show();

            // Else, hide it
            else $("#transport-type-wrapper").hide();

            // Initialize the values to select in the selector
            let categoryToSelect, transportTypeToSelect;

            // If the user hasn't already specified the location category, select "none"
            if (this._vals.locationCategory === "") categoryToSelect = "none";

            // Else, select the value already selected by the user
            else categoryToSelect = this._vals.locationCategory;

            // Change the selected option of the selector
            $locationSelect.get(0).selectedIndex = $locationSelect.find("option[value=" + categoryToSelect + "]").index();

            // Change the selector label
            utils.changeSelectorLabel("location-select");

            // If the user hasn't already specified the transport type, select "none"
            if (this._vals.transportType === "") transportTypeToSelect = "none";

            // Else, select the value already selected by the user
            else transportTypeToSelect = this._vals.transportType;

            // Change the selected option of the selector
            $transportTypeSelect.get(0).selectedIndex = $transportTypeSelect.find("option[value=" + transportTypeToSelect + "]").index();

            // Change the selector label
            utils.changeSelectorLabel("transport-type-select");

            // Set the value of the "location reference" text field
            $("#location-reference").val(this._vals.visualReference);

            // Open the dialog
            this.openFullscreenDialog($("#dialog-location"));

        });

        // Fired when the values of the location sector changes
        $locationSelect.change(() => {

            // Set the label
            utils.changeSelectorLabel("location-select");

            // If the selected location is "transportStation", show the transport type selector
            if ($locationSelect.val() === "transportStation") $("#transport-type-wrapper").show();

            // Else, hide it
            else $("#transport-type-wrapper").hide();

        });

        // Fired when the values of the transport type sector changes
        $transportTypeSelect.change(() => utils.changeSelectorLabel("transport-type-select"));

        // Fired when the user clicks on "close"
        $("#location-close").click(() => this.closeFullscreenDialog($("#dialog-location")));

        // Fired when the user clicks on "done"
        $("#location-done").click(() => {

            // Save the value of the location category
            this._vals.locationCategory = $locationSelect.val();

            // If the value is not present, return
            if (this._vals.locationCategory === "none") {
                utils.logOrToast(i18next.t("messages.mandatoryLocationCategory"), "long");
                return;
            }

            // Save the value of the transport type
            this._vals.transportType = $transportTypeSelect.val();

            // If the location category is "transportStation" and the value is not present, return
            if (this._vals.locationCategory === "transportStation" && this._vals.transportType === "none") {
                utils.logOrToast(i18next.t("messages.mandatoryTransportType"), "long");
                return;
            }

            // Save the value of the visual reference
            this._vals.visualReference = $("#location-reference").val();

            // Set the text on the main page
            $("#location-text").html(i18next.t("insert.locationCategory.enum." + this._vals.locationCategory));

            // Close the dialog
            this.closeFullscreenDialog($("#dialog-location"));

        });


        // Value of the new selected floor
        let newFloor = "";

        // Fired when the user clicks on the "floor" request
        $("#floor-request").click(() => {

            // Initialize the value to select in the selector
            let toShow;

            // If the user hasn't already specified the floor, select "0"
            if (this._vals.floor === "") toShow = "0";

            // Else, select the value already selected by the user
            else toShow = this._vals.floor;

            // Set the value of the counter
            $("#floor-counter-value").html(toShow.toString());

            // Set the new floor equals to the currently selected floor
            newFloor = this._vals.floor;

            // Open the dialog
            this.openDialog($("#dialog-floor"));

        });

        // Fired when the user clicks on the "+" button of the counter
        $("#floor-counter-add").click(() => {

            // Don't go over 10
            if (newFloor === 10) return;

            // Increment the floor
            newFloor++;

            // Set the value of the counter
            $("#floor-counter-value").html(newFloor.toString());

        });

        // Fired when the user clicks on the "-" button of the counter
        $("#floor-counter-sub").click(() => {

            // Don't go below -4
            if (newFloor === -4) return;

            // Decrement the floor
            newFloor--;

            // Set the value of the counter
            $("#floor-counter-value").html(newFloor.toString());

        });

        // Fired when the user clicks on "cancel"
        $("#floor-cancel").click(() => this.closeDialog($("#dialog-floor")));

        // Fired when the user clicks on "ok"
        $("#floor-ok").click(() => {

            // If the new floor has not been modified, set it to 0
            if (newFloor === "") newFloor = 0;

            // Set the floor to the new floor
            this._vals.floor = newFloor;

            // Set the text on the main page
            $("#floor-text").html(this._vals.floor.toString());

            // Close the dialog
            this.closeDialog($("#dialog-floor"));

        });


        // Fired when the user clicks on the "temporal accessibility" request
        $("#temporal-accessibility-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect;

            // If the user hasn't already specified the floor, select "h24"
            if (this._vals.temporalAccessibility === "") toSelect = "h24";

            // Else, select the value already selected by the user
            else toSelect = this._vals.temporalAccessibility;

            // Set the value of the selector
            $("input[name='temporalAccessibility'][value='" + toSelect + "']").prop("checked", "true");

            // Open the dialog
            this.openDialog($("#dialog-temporal-accessibility"));

        });

        // Fired when the user clicks on "cancel"
        $("#temporal-cancel").click(() => this.closeDialog($("#dialog-temporal-accessibility")));

        // Fired when the user clicks on "ok"
        $("#temporal-ok").click(() => {

            // Save the value of the selector
            this._vals.temporalAccessibility = $("input[name='temporalAccessibility']:checked").val();

            // Set the text of the main page
            $("#temporal-text").html(i18next.t("insert.temporalAccessibility.enum." + this._vals.temporalAccessibility));

            // Close the dialog
            this.closeDialog($("#dialog-temporal-accessibility"));

        });


        // Fired when the user clicks on the "recovery" request
        $("#recovery-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect;

            // If the user hasn't already specified the recovery, select "immediate"
            if (this._vals.recovery === "") toSelect = "immediate";

            // Else, select the value already selected by the user
            else toSelect = this._vals.recovery;

            // Set the value of the selector
            $("input[name='recovery'][value='" + toSelect + "']").prop("checked", "true");

            // Open the dialog
            this.openDialog($("#dialog-recovery"));

        });

        // Fired when the user clicks on "cancel"
        $("#recovery-cancel").click(() => this.closeDialog($("#dialog-recovery")));

        // Fired when the user clicks on "ok"
        $("#recovery-ok").click(() => {

            // Save the value of the selector
            this._vals.recovery = $("input[name='recovery']:checked").val();

            // Set the text of the main page
            $("#recovery-text").html(i18next.t("insert.recovery.enum." + this._vals.recovery));

            // Close the dialog
            this.closeDialog($("#dialog-recovery"));

        });


        // Fired when the user clicks on the "signage" request
        $("#signage-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect;

            // If the user hasn't already specified the signage, select "Great"
            if (this._vals.signage === "") toSelect = "great";

            // Else, select the value already selected by the user
            else toSelect = this._vals.signage;

            // Set the value of the selector
            $("input[name='signage'][value='" + toSelect + "']").prop("checked", "true");

            // Open the dialog
            this.openDialog($("#dialog-signage"));

        });

        // Fired when the user clicks on "cancel"
        $("#signage-cancel").click(() => this.closeDialog($("#dialog-signage")));

        // Fired when the user clicks on "ok"
        $("#signage-ok").click(() => {

            // Save the value of the selector
            this._vals.signage = $("input[name='signage']:checked").val();

            // Set the text of the main page
            $("#signage-text").html(i18next.t("insert.signage.enum." + this._vals.signage));

            // Close the dialog
            this.closeDialog($("#dialog-signage"));

        });


        // Fired when the user clicks on the "notes" request
        $("#notes-request").click(() => {

            // Set the value of the text fields
            $("#brand").val(this._vals.brand);
            $("#notes").val(this._vals.notes);

            // Open the dialog
            this.openFullscreenDialog($("#dialog-notes"));

        });

        // Fired when the user clicks on "close"
        $("#notes-close").click(() => this.closeFullscreenDialog($("#dialog-notes")));

        // Fired when the user clicks on "done"
        $("#notes-done").click(() => {

            // Save the values
            this._vals.brand = $("#brand").val();
            this._vals.notes = $("#notes").val();

            // Set the text of the main page
            $("#notes-text").html(i18next.t("insert.notes.editText"));

            // Close the dialog
            this.closeFullscreenDialog($("#dialog-notes"));

        });


        // Fired when the user clicks on the photo thumbnail
        this._$photoThm.click(() => {

            // If no photo has been taken, get a picture
            if (this._vals.photo === "") this.getPicture();

            // Else open the image screen to show the photo
            else utils.openImgScreen(
                this._$photoThm.find("img").attr("src"),
                true,
                () => this.getPicture(),
                () => {

                    // Delete the saved photo
                    this._vals.photo = "";

                    // Set the placeholder
                    this._$photoThm.find("img").attr("src", "img/img-placeholder-200.png").hide();

                    // Show the icon
                    this._$photoThm.find("i").show();

                }
            )

        });

        // ToDO delete
        $("#tmp-photo-input").change(() => {

            this._vals.photo = $("#tmp-photo-input")[0].files[0];

            let reader = new FileReader();

            reader.onloadend = e => {
                this._$photoThm.find("img").attr("src", e.target.result).show();
                this._$photoThm.find("i").hide();
            };

            reader.readAsDataURL(this._vals.photo);

        });

    }


    /** Take a picture with the phone camera */
    getPicture() {

        // ToDo delete
        if (!App.isCordova) {
            $("#tmp-photo-input").click();
            return;
        }

        // Options for the photo
        const opt = {
            quality           : 30,                              // Output quality is 30% of the original photo
            destinationType   : Camera.DestinationType.FILE_URI, // Output as a file uri
            sourceType        : Camera.PictureSourceType.CAMERA, // Take only from the camera (not from the gallery)
            encodingType      : Camera.EncodingType.JPEG,        // Encode the output as jpeg
            mediaType         : Camera.MediaType.PICTURE,        // The output is a picture
            allowEdit         : false,                           // Prevent editing
            correctOrientation: true                             // Automatically correct the orientation of the picture
        };

        // Get the picture
        navigator.camera.getPicture(
            // Fired if the picture is taken successfully
            fileURI => {

                // Parse the file uri
                const res = JSON.parse(fileURI);

                // Save the name of the photo
                this._vals.photo = res.filename;

                // Parse the metadata of the photo
                const metadata = JSON.parse(res.json_metadata);

                // Save the geolocation info of the photo
                if (metadata && metadata !== {}) {
                    if (device.platform === "iOS")
                        this._vals.photoCoordinates = [metadata.GPS.Latitude, metadata.GPS.Longitude];
                    else
                        this._vals.photoCoordinates = [metadata.gpsLatitude, metadata.gpsLatitude];
                }

                // Show the image on the thumbnail
                this._$photoThm.find("img").attr("src", this._vals.photo).show();

                // Hide the placeholder
                this._$photoThm.find("i").hide();

            },

            // Fired if there is an error
            err => {
                console.log(`Error taking picture ${err}`);

                // Alert the user
                utils.createAlert("", i18next.t("dialogs.pictureError"), i18next.t("dialogs.btnOk"));
            },

            // Camera options
            opt);

    }


    /** Insert a new defibrillator in the database. */
    post() {

        // Open the loader
        utils.openLoader();

        // Create the formData object
        const formData = new FormData();

        // Append to the formData all the data
        formData.append("coordinates", JSON.stringify(this._vals.coordinates));
        formData.append("coordinatesAccuracy", this._vals.coordinatesAccuracy);
        formData.append("presence", this._vals.presence);
        formData.append("locationCategory", this._vals.locationCategory);
        formData.append("transportType", this._vals.transportType);
        formData.append("visualReference", this._vals.visualReference);
        formData.append("floor", this._vals.floor);
        formData.append("temporalAccessibility", this._vals.temporalAccessibility);
        formData.append("recovery", this._vals.recovery);
        formData.append("signage", this._vals.signage);
        formData.append("brand", this._vals.brand);
        formData.append("notes", this._vals.notes);

        // ToDo delete
        if (!App.isCordova) {
            formData.append("image", this._vals.photo);

            // Post the defibrillator
            defibrillator.post(formData)
                .then((data) => {

                    // Close the loader
                    utils.closeLoader();

                    // Show the new defibrillator
                    defibrillator.show(data.id, data.coords);

                    // Close the activity
                    InsertActivity.getInstance().close();

                });

            return;
        }

        formData.append("imageCoordinates", this._vals.photoCoordinates);

        // Append the image
        utils.appendFile(formData, this._vals.photo)
            .then(formData => {

                // Post the defibrillator
                return defibrillator.post(formData);

            })
            .then((data) => {

                // Close the loader
                utils.closeLoader();

                // Show the new defibrillator
                defibrillator.show(data.id, data.coords);

                // Close the activity
                this.close();

            });

    }


    /** Modifies a defibrillator already in the database. */
    put() {

        // Open the loader
        utils.openLoader();

        // Create the formData object
        const formData = new FormData();

        // Append to the formData all the data
        formData.append("presence", this._vals.presence);
        formData.append("locationCategory", this._vals.locationCategory);
        formData.append("transportType", this._vals.transportType);
        formData.append("visualReference", this._vals.visualReference);
        formData.append("floor", this._vals.floor);
        formData.append("temporalAccessibility", this._vals.temporalAccessibility);
        formData.append("recovery", this._vals.recovery);
        formData.append("signage", this._vals.signage);
        formData.append("brand", this._vals.brand);
        formData.append("notes", this._vals.notes);

        // ToDo delete
        if (!App.isCordova) {

            if (this._vals.photo !== this._oldPhoto)
                formData.append("image", this._vals.photo);

            defibrillator.put(this._defId, formData)
                .then((data) => {

                    // Close the loader
                    utils.closeLoader();

                    InfoActivity.getInstance().getDefibrillator(data.id);

                    // Close the activity
                    InsertActivity.getInstance().close();

                })
                .catch(() => {

                    // Close the loader
                    utils.closeLoader();

                });

            return;
        }

        // Create a temporary variable
        let file = null;

        // If the photo has been changed
        if (this._vals.photo !== this._oldPhoto) {

            // Append the new image coordinates
            formData.append("imageCoordinates", this._vals.photoCoordinates);

            // Save the photo in the temporary variable
            file = this._vals.photo;

        }

        // Append the image
        utils.appendFile(formData, file)
            .then(formData => {

                // Put the defibrillator
                return defibrillator.put(InsertActivity.getInstance()._defId, formData);

            })
            .then((data) => {

                // Show the info about the defibrillator
                InfoActivity.getInstance().getDefibrillator(data.id);

                // Close the loader
                utils.closeLoader();

                // Close the activity
                InsertActivity.getInstance().close();

            });

    }


    /***********************************************************************
     * Utility methods
     ***********************************************************************/

    /**
     * Opens a full-screen dialog.
     *
     * @param {object} dialog - The dialog to open
     */
    openFullscreenDialog(dialog) {

        // Show the dialog
        dialog.show();

        // Set the currently opened full dialog to the dialog
        this._currOpenedFullDialog = dialog;

    }

    /**
     * Closes a full-screen dialog.
     *
     * @param {object} dialog - the dialog to close.
     */
    closeFullscreenDialog(dialog) {

        // Hide the dialog
        dialog.scrollTop(0).hide();

        // Set the currently opened full dialog to null
        this._currOpenedFullDialog = null;

    }


    /**
     * Opens a dialog.
     *
     * @param {object} toOpen - The dialog to open
     */
    openDialog(toOpen) {

        // Show an opaque overlay
        $("#opaque-overlay").show();

        // Hide the y-overflow of the main page
        $("#page--insert").css("overflow-y", "hidden");

        // Show the dialog
        toOpen.show();

        // Set the currently opened dialog to the dialog
        this._currOpenedDialog = toOpen;

    }

    /**
     * Closes a dialog.
     *
     * @param {object} toClose - The dialog to close.
     */
    closeDialog(toClose) {

        // Hide the dialog
        toClose.hide();

        // Hide the opaque overlay
        $("#opaque-overlay").hide();

        // Set the y-overflow of the main page to "scroll"
        $("#page--insert").css("overflow-y", "scroll");

        // Set the currently opened dialog to null
        this._currOpenedDialog = null;

    }

}