"use strict";

/**
 * Collection of utility functions.
 *
 * @namespace
 * @author Edoardo Pessina
 */
const utils = {

    /** @private */ _$alertOverlay: $("#alert-dialog-overlay"),

    /** Flag the states if the loader is currently opened. */
    isLoaderOpen: false,

    /** Flag the states if the alert dialog is currently opened. */
    isAlertOpen: false,

    /** Flag the states if the image screen is currently opened. */
    isImgScreenOpen: false,


    /**
     * Switches between two activities.
     *
     * @param {Object} toOpen - The activity to open.
     * @param {boolean} [close=false] - A boolean stating if the current activity has to be closed or not.
     * @param {Object} [toClose=null] - The activity to close.
     */
    switchActivity: (toOpen, close = false, toClose = null) => {

        // If the other activity should be closed, close it
        if (close) toClose.close();

        // Open the activity to open
        toOpen.open();

    },


    /**
     * Insert a new activity at the bottom of the activity stack.
     *
     * @param {object} activity - The activity to push.
     * @return {number} The current quantity of activities in the stack.
     */
    pushStackActivity: activity => app.activityStack.push(activity),

    /**
     * Removes the last activity from the activity stack.
     *
     * @return {object} The removed activity.
     */
    popStackActivity: () => app.activityStack.pop(),


    /**
     * Checks if the authentication token is expired and in case logs out from the application.
     *
     * @return {boolean} True if the token is expired.
     */
    isTokenExpired: () => {

        // Retrieve the expiration date from the storage
        const expireDate = localStorage.getItem("mapad-expireDate");

        // If the token is not expired or if the user is a guest, return true
        if ((expireDate && new Date(expireDate) > new Date()) || app.isGuest) return false;

        // For each activity in the stack
        for (let i = (app.activityStack.length - 1); i >= 0; i--) {

            // Close the activity
            app.activityStack[i].close();

        }

        // Logout
        LoginActivity.getInstance().logout();

        // Open the login activity
        LoginActivity.getInstance().open();

        // Close any open loader
        utils.closeLoader();

        // Close any open alert
        utils.closeAlert();

        // Alert the user
        utils.createAlert("", i18next.t("dialogs.tokenExpired"), i18next.t("dialogs.btnOk"));

        // Return true
        return true;

    },


    /**
     * Appends a file as a blob to the given formData.
     *
     * @param {FormData} formData - The form data to which the file has to be appended
     * @param {(string|null)} [fileUri] - The uri of the file to append.
     * @returns {Promise<FormData>} - A promise containing the formData with the file append to it.
     */
    appendFile(formData, fileUri) {

        // Return a promise
        return new Promise((resolve, reject) => {

            // If no file is provided
            if (!fileUri) {

                // Resolve
                resolve(formData);

                // Return
                return;

            }

            // Find the file in the file system
            window.resolveLocalFileSystemURL(
                // Url of the file
                fileUri,

                // If the file is found
                fileEntry => {

                    // Get the file
                    fileEntry.file(file => {

                        // Create a file reader
                        let reader = new FileReader();

                        // When the reader has finished loading the file
                        reader.onloadend = e => {

                            // Create a blob to store the file
                            let blob = new Blob([new Uint8Array(e.target.result)], { type: "image/jpeg" });

                            // Append the blob to the form data
                            formData.append("image", blob);

                            // Resolve the promise
                            resolve(formData);

                        };

                        // If an error occurs
                        reader.onerror = fileReadResult => {

                            console.error(`Reader error ${fileReadResult}`);

                            // Alert the user
                            utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));

                            // Reject the promise
                            reject();

                        };

                        // Read the file
                        reader.readAsArrayBuffer(file);

                    }, err => {

                        console.error(`Error getting the fileEntry file ${err}`);

                        // Alert the user
                        utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));

                        // Reject the promise
                        reject();

                    })

                },

                // If an error occurs
                err => {

                    console.error(`Error getting the file ${err}`);

                    // Alert the user
                    utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));

                    // Reject the promise
                    reject();

                }
            );

        });

    },


    /**
     * Creates and display an alert dialog with a message and up to two buttons.
     *
     * @param {string} title - The title of the dialog.
     * @param {string} msg - The message to display.
     * @param {string} btn1 - The text of the first button.
     * @param {(function|null)} [clbBtn1] - The function to call when the first button is clicked.
     * @param {(string|null)} [btn2] - The text of the second button.
     * @param {(function|null)} [clbBtn2] - The function to call when the second button is clicked.
     */
    createAlert: (title, msg, btn1, clbBtn1 = null, btn2 = null, clbBtn2 = null) => {

        // If the title is empty, hide it
        if (title === "") utils._$alertOverlay.find(".dialog-title").hide();

        // Else, show it
        else utils._$alertOverlay.find(".dialog-title").html(title);

        // Set the dialog message
        utils._$alertOverlay.find(".dialog-text").html(msg);

        // Set the text and the behaviour of the first button
        $("#alert-first-button").html(btn1).unbind("click").click(() => {

            // Close the alert
            utils.closeAlert();

            // If a callback for the first button has been provided, call it
            if (clbBtn1) clbBtn1();

        });

        // If a text for the second button has been provided
        if (btn2) {

            // Show, set the text and the behaviour of the second button
            $("#alert-second-button").show().html(btn2).unbind("click").click(() => {

                // Close the alert
                utils.closeAlert();

                // If a callback for the second button has been provided, call it
                if (clbBtn2) clbBtn2();

            });

        }

        // Show the dialog
        utils._$alertOverlay.find(".dialog-wrapper").show();

        // Show the overlay
        utils._$alertOverlay.show();

        // Set the flag to true
        utils.isAlertOpen = true;

    },

    /** Closes the alert dialog. */
    closeAlert: () => {

        // Hide the overlay and cancel the dialog message
        utils._$alertOverlay.hide().children(".dialog-text").html("");

        // Show the title and cancel its content
        utils._$alertOverlay.find(".dialog-title").show().html("");

        // Hide the second button
        $("#alert-second-button").hide();

        // Hide the dialog
        utils._$alertOverlay.find(".dialog-wrapper").hide();

        // Set the flag to false
        utils.isAlertOpen = false;

    },


    /** Opens a spinner loader. */
    openLoader: () => {

        // Show the spinner
        utils._$alertOverlay.find(".spinner-wrapper").show();

        // Show the opaque overlay
        utils._$alertOverlay.show();

        // Set the flag to true
        utils.isLoaderOpen = true;

    },

    /** Opens the spinner loader. */
    closeLoader: () => {

        // Hide the opaque overlay
        utils._$alertOverlay.hide();

        // Hide the spinner
        utils._$alertOverlay.find(".spinner-wrapper").hide();

        // Set the flag to false
        utils.isLoaderOpen = false;

    },


    /**
     * Displays a message to the user.
     *
     * @param {string} msg - The message to display.
     * @param {string} duration - How long the message should stay on the screen.
     */
    logOrToast: (msg, duration) => {

        // ToDo delete
        if (!App.isCordova) {
            console.log(msg);
            return;
        }

        window.plugins.toast.show(msg, duration, "bottom");

    },


    /**
     * Changes the label of a selector.
     *
     * @param {string} selectorId - The id of the selector.
     * @param {boolean} [changeColor=false] - True if the color of the label should be changed.
     */
    changeSelectorLabel: (selectorId, changeColor = false) => {

        // Save the selector and its label
        const $selector = $(`#${selectorId}`),
              $label    = $(`[for='${selectorId}'`).find(".label-description");

        // If there is nothing selected
        if ($selector.val() === "none") {

            // Set the label to the default one
            $label.html(i18next.t(`selectors.${selectorId}DefLabel`));

            // If changeColor is true, change the color of the label
            if (changeColor) $label.css("color", "#757575");

        }

        // If an option is selected
        else {

            // Set the label to the selected option
            $label.html($selector.find("option:selected").text());

            // If changeColor is true, change the color of the label
            if (changeColor) $label.css("color", "#000000");

        }

    },

    /**
     * Resets the label of a selector to the default one.
     *
     * @param selectorId - The id of the selector.
     */
    resetSelector: selectorId => {

        // Set the default option as selected
        $("#" + selectorId).get(0).selectedIndex = 0;

        //Change the label
        utils.changeSelectorLabel(selectorId);

    },


    /**
     * Opens a screen that displays an image.
     *
     * @param {string} scr - The url of the image.
     * @param {boolean} [editable=false] - True if the image can be deleted or modified.
     * @param {function} [clbEdit] - Function to be called when the user clicks on the "edit" button.
     * @param {function} [clbCancel] - Function to be called when the user clicks on the "cancel" button.
     */
    openImgScreen: (scr, editable = false, clbEdit, clbCancel) => {

        // Set the source of the image
        $("#img-screen-container img").attr("src", scr);

        // When the user clicks on the "close" button, close the screen
        $("#img-screen-close").click(() => utils.closeImgScreen());

        // If editable is true
        if (editable) {

            // Set the behaviour of the "edit" button and show it
            $("#img-screen-edit")
                .unbind("click")
                .click(() => {

                    // Close the image screen
                    utils.closeImgScreen();

                    // Fire the callback
                    clbEdit();

                })
                .parent()
                .show();

            // Set the behaviour of the "delete" button and show it
            $("#img-screen-delete")
                .show()
                .unbind("click")
                .click(() => {

                    // Show an alert to ask for the user's confirmation
                    utils.createAlert(
                        "",
                        i18next.t("dialogs.photoScreen.deletePictureConfirmation"),
                        i18next.t("dialogs.btnCancel"),
                        null,
                        i18next.t("dialogs.btnOk"),
                        () => {

                            // Call the callback
                            clbCancel();

                            // Close the screen
                            utils.closeImgScreen();

                        }
                    );

                })
                .parent().show();

        }

        // Show the screen
        $("#img-screen").show();

        // Set the flag to true
        utils.isImgScreenOpen = true;

    },

    /** Closes the image screen. */
    closeImgScreen: () => {

        // Hide the screen
        $("#img-screen").hide();

        // Reset the image source
        $("#img-screen-container img").attr("src", "");

        // Hide the "edit" button
        $("#img-screen-edit").parent().hide();

        // HIde the delete button
        $("#img-screen-delete").parent().hide();

        // Set the flag to false
        utils.isImgScreenOpen = false;

    },


    /**
     * Converts an angle form degrees to radiant.
     *
     * @param {number} deg - The angle in degrees.
     * @return {number} - The angle in radiant.
     */
    deg2rad: deg => { return deg * Math.PI / 180 },

    /**
     * Calculate the great-circle distance in meters between two points on the Earth using the Haversine formula.
     *
     * @param {number} lat1 - Latitude of the first point.
     * @param {number} lon1 - Longitude of the first point.
     * @param {number} lat2 - Latitude of the second point.
     * @param {number} lon2 - Longitude of the second point.
     * @return {number} Distance in meters between the two points.
     */
    haversineDistance: (lat1, lon1, lat2, lon2) => {

        // Save the radius of the Earth in meters
        const R = 6371000;

        // Calculate the delta between the latitude and the longitude of the two points
        const dLat = utils.deg2rad(lat2 - lat1),
              dLon = utils.deg2rad(lon2 - lon1);

        // Calculate the sin of the latitude deltas
        const sinDLat = Math.sin(dLat / 2),
              sinDLon = Math.sin(dLon / 2);

        // Calculate the haversine of the central angle of the sphere
        const a = Math.pow(sinDLat, 2) + Math.pow(sinDLon, 2) * Math.cos(utils.deg2rad(lat1)) * Math.cos(utils.deg2rad(lat2));

        // Calculate the central angle of the sphere
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Return the distance
        return R * c;

    },

};