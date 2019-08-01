"use strict";

const utils = {

    /**
     * Switched between two activities.
     *
     * @param {Object} toOpen - The activity to open.
     * @param {Boolean} [close=false] - A boolean stating if the current activity has to be closed or not.
     * @param {Object} [toClose=null] - The activity to close.
     */
    switchActivity: (toOpen, close = false, toClose = null) => {
        toOpen.open();
        if (close) toClose.close();
    },


    /**
     * Appends a file as a blob to the given formData.
     *
     * @param {FormData} formData - The form data to which the file has to be appended
     * @param {string} fileUri - The uri of the file to append.
     * @returns {Promise<FormData>} - A promise containing the formData with the file append to it.
     */
    appendFile(formData, fileUri) {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Find the file in the file system
            window.resolveLocalFileSystemURL(fileUri, fileEntry => {

                    // Get the file
                    fileEntry.file(file => {

                        // Create a file reader
                        let reader = new FileReader();

                        // When the reader has finished loading the file
                        reader.onloadend = () => {

                            // Create a blob to store the file
                            let blob = new Blob([new Uint8Array(this.result)], { type: "image/jpeg" });

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

                }, err => {

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
     * Creates and display a new alert dialog with a message and up to two buttons.
     * It must be passed the text of the buttons (a null value means that there is no button) and a callback function to be
     * executed when the buttons are clicked (a null value means no callback).
     *
     * @param title: the title of the dialog.
     * @param msg: the message to display.
     * @param btn1: the text of the first button.
     * @param clbBtn1: the function to call when the first button is clicked.
     * @param btn2: the text of the second button.
     * @param clbBtn2: the function to call when the second button is clicked.
     */
    createAlert: (title, msg, btn1, clbBtn1 = null, btn2 = null, clbBtn2 = null) => {

        if (title === "")
            $alertOverlay.find(".dialog-title").hide();
        else
            $alertOverlay.find(".dialog-title").html(title);

        $alertOverlay.find(".dialog-text").html(msg);

        $("#alert-first-button")
            .html(btn1)
            .unbind("click")
            .click(() => {
                utils.closeAlert();
                if (clbBtn1) clbBtn1();
            });

        if (btn2) {

            $("#alert-second-button")
                .show()
                .html(btn2)
                .unbind("click")
                .click(() => {
                    utils.closeAlert();
                    if (clbBtn2) clbBtn2();
                });

        }

        $alertOverlay.find(".dialog-wrapper").show();
        $alertOverlay.show();

    },

    closeAlert: () => {

        $alertOverlay
            .hide()
            .children(".dialog-text").html("");

        $alertOverlay.find(".dialog-title").show();

        $("#alert-second-button").hide();

        $alertOverlay.find(".dialog-wrapper").hide();

    },


    openLoader: () => {

        $alertOverlay.find(".spinner-wrapper").show();

        $alertOverlay.show();

    },

    closeLoader: () => {

        $alertOverlay.hide();

        $alertOverlay.find(".spinner-wrapper").hide();

    },


    logOrToast: (msg, duration) => {

        if (!isCordova) {
            console.log(msg);
            return;
        }

        window.plugins.toast.show(msg, duration, "bottom");

    },


    changeSelectorLabel: (selectorId, changeColor = false) => {

        const $selector = $("#" + selectorId),
              $label    = $("[for='" + selectorId + "'").find(".label-description");

        if ($selector.val() === "none") {

            $label.html(i18next.t("selectors." + selectorId + "DefLabel"));
            if (changeColor) $label.css("color", "#757575");

        } else {

            $label.html($selector.find("option:selected").text());
            if (changeColor) $label.css("color", "#000000");

        }

    },

    resetSelector: selectorId => {
        $("#" + selectorId).get(0).selectedIndex = 0;
        utils.changeSelectorLabel(selectorId);
    },


    openImgScreen: (scr, editable = false, clbEdit, clbCancel) => {

        $("#img-screen-container img").attr("src", scr);

        $("#img-screen-close").click(() => utils.closeImgScreen());

        if (editable) {

            $("#img-screen-edit")
                .unbind("click")
                .click(() => {
                    utils.closeImgScreen();
                    clbEdit();
                })
                .parent().show();

            $("#img-screen-delete")
                .show()
                .unbind("click")
                .click(() => {

                    utils.createAlert(
                        "",
                        i18next.t("dialogs.photoScreen.deletePictureConfirmation"),
                        i18next.t("dialogs.btnCancel"),
                        null,
                        i18next.t("dialogs.btnOk"),
                        () => {
                            clbCancel();
                            utils.closeImgScreen();
                        }
                    );

                })
                .parent().show();

        }

        $("#img-screen").show();

    },

    closeImgScreen: () => {

        $("#img-screen").hide();

        $("#img-screen-container img").attr("src", "");

        $("#img-screen-edit").parent().hide();

        $("#img-screen-delete").parent().hide();

    },

};