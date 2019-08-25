"use strict";

/**
 *  Activity to visualize the information about a defibrillator.
 *
 * @author Edoardo Pessina
 */
class InfoActivity {

    /** @private */ static _instance;

    /** Options to format the date */
    static get dateOpts() {
        return {
            year  : "numeric",
            month : "2-digit",
            day   : "2-digit",
            hour  : "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    }


    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link InfoActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        // Cache the screen
        this._screen = $("#page--info");

        // Cache the placeholders
        this._placeholders = $("#page--info .placeholder");


        // When the user clicks on the "close" button, close the activity
        $("#info-close").click(() => this.close());

        // When the user clicks on the photo thumbnail, open the image screen
        $("#info-photo-thm").click(function () { utils.openImgScreen($(this).attr("src")) });

    }

    /**
     * Returns the current InfoActivity instance if any, otherwise creates it.
     *
     * @returns {InfoActivity} The activity instance.
     */
    static getInstance() {

        if (!InfoActivity._instance)
            InfoActivity._instance = new InfoActivity();

        return InfoActivity._instance;

    }


    /**
     * Opens the activity.
     *
     * @param {string} id - The id of the defibrillator
     */
    open(id) {

        // Push the activity into the stack
        utils.pushStackActivity(this);

        // Animate the placeholders
        this._placeholders.addClass("ph-animate");

        // Show the screen
        this._screen.show();

        // Get and display the defibrillator
        this.getDefibrillator(id);

    }

    /** Closes the activity and resets its fields. */
    close() {

        // Pop the activity from the stack
        utils.popStackActivity();

        // Hide the screen
        this._screen.scrollTop(0).hide();

        // Hide the content behind the placeholders
        $("#page--info .ph-hidden-content").hide();

        // Stop the placeholders animation
        this._placeholders.removeClass("ph-animate").show();

        // Hide the delete button
        $("#info-delete").hide();

        // Hide the info button
        $("#info-edit").hide();

        // Delete the content of each of the fields
        $("#info-createdAt .info-content").html("");
        $("#info-updatedAt .info-content").html("");
        $("#info-coordinates .info-content").html("");
        $("#info-accuracy .info-content").html("");
        $("#info-presence .info-content").html("");
        $("#info-locationCategory .info-content").html("");
        $("#info-visualReference .info-content").html("");
        $("#info-floor .info-content").html("");
        $("#info-temporalAccessibility .info-content").html("");
        $("#info-recovery .info-content").html("");
        $("#info-signage .info-content").html("");
        $("#info-brand .info-content").html("");
        $("#info-notes .info-content").html("");

        // Show the image placeholder
        $("#info-photo-preview").attr("src", "img/no-img-placeholder-200.png");

    }

    /** Defines the behaviour of the back button for this activity */
    onBackPressed() {

        // Close the activity
        this.close();

    }


    /**
     * Retrieves and displays the information about a defibrillator.
     *
     * @param {string} id - The id of the defibrillator.
     */
    getDefibrillator(id) {

        // Get the data about the defibrillator
        defibrillator.get(id)
            .then(data => {

                // Show and initialize the "delete" button
                $("#info-delete").show().unbind("click").click(() => {

                    // Ask for confirmation and delete the defibrillator
                    utils.createAlert(
                        "",
                        i18next.t("dialogs.deleteConfirmation"),
                        i18next.t("dialogs.btnCancel"),
                        null,
                        i18next.t("dialogs.btnOk"),
                        () => {

                            // Open the loader
                            utils.openLoader();

                            // Delete the defibrillator
                            defibrillator.delete(id)
                                .then(() => {

                                    // Close the loader
                                    utils.closeLoader();

                                    // Close the activity
                                    this.close();

                                })
                                .catch(() => {

                                    // Close the loader
                                    utils.closeLoader();

                                })

                        }
                    );

                });

                // Show and initialize the "edit" button
                $("#info-edit").show().unbind("click").click(() => {

                    // Open the insert activity in "put" mode
                    InsertActivity.getInstance().openPut(data);

                    // Scroll to top
                    this._screen.scrollTop(0);

                });

                // Show the data
                this.show(data);

            })
            .catch(() => {

                // Close the activity
                this.close();

            });

    }


    /**
     * Shows the data.
     *
     * @param {object} data - The data to show.
     */
    show(data) {

        // For each key in the object
        for (let key in data) {

            // If the object has a property associated with the key and the key is not "transportType"
            if (data.hasOwnProperty(key) && key !== "transportType")

            // Set the content of the field associated with the key
                $("#info-" + key + " .info-content").html(() => {

                    // Save the value of the key
                    const val = data[key];

                    // If the val is empty, set the content to "-"
                    if (val === "") return "-";

                    // Set the value form based on the key
                    switch (key) {

                        // Display the date formatted accordingly to the current language
                        case "createdAt":
                        case "updatedAt":
                            return new Date(val).toLocaleDateString(i18next.language, InfoActivity.dateOpts);

                        // Display the coordinates
                        case "coordinates":
                            return val[0] + ", " + val[1];

                        // Display the accuracy
                        case "accuracy":
                            if (val === 0 || val === null) return i18next.t("info.unknown");
                            return val + " " + i18next.t("info.accuracyUnit");

                        // Display the location category eventually with the type of the transport station
                        case "locationCategory":
                            let content = i18next.t("insert.locationCategory.enum." + val);
                            if (data.transportType !== "")
                                content += ` (${data.transportType})`;
                            return content;

                        // Display just the value
                        case "visualReference":
                        case "floor":
                        case "brand":
                        case "notes":
                            return val;

                        default:
                            return i18next.t("insert." + key + ".enum." + val);
                    }

                });
        }

        // Show the photo
        $("#info-photo-thm").attr("src", `${settings.serverUrl}/${data.imageUrl}`);

        // Hide the placeholders
        this._placeholders.hide().removeClass("ph-animate");

        // Show the content hidden by the placeholders
        $("#page--info .ph-hidden-content").show();

    }

}