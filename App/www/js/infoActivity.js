"use strict";

/**
 *  Activity to visualize the information about a defibrillator.
 *
 * @author Edoardo Pessina
 */
class InfoActivity {

    /** @private */ static _instance;

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


    /** Opens the activity.
     *
     * @param {string} id - The id of the defibrillator
     */
    open(id) {

        // Animate the placeholders
        this._placeholders.addClass("ph-animate");

        // Show the screen
        this._screen.show();

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

                });

                // Show the data
                this.show(data);

            })
            .catch(() => {

                // Close the activity
                this.close();

            });

    }

    /** Closes the activity and resets its fields. */
    close() {

        this._screen.scrollTop(0).hide();

    }


    /**
     * Show the data.
     *
     * @param {object} data - The data to show.
     */
    show(data) {

    }


}