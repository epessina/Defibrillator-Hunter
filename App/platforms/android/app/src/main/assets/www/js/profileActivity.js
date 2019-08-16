"use strict";

/**
 *  Activity to visualize the user's profile.
 *
 * @author Edoardo Pessina
 */
class ProfileActivity {

    /** @private */ static _instance;


    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link ProfileActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        // Cache the screen
        this._screen = $("#page--profile");

        // Cache the placeholders
        this._placeholders = $("#page--profile .placeholder");

        // Variable to save the data of the current user
        this.userData = null;

        // When the user clicks on the "close" button, close the activity
        $("#profile-back").click(() => this.close());


        // Initialize the photo menu
        this.initPhotoMenu();

        // Initialize the settings menu
        this.initSettingsMenu();

        // Initialize the change email menu
        this.initChangeEmail();

        // Initialize the change password menu
        this.initChangePw();


    }

    /**
     * Returns the current InfoActivity instance if any, otherwise creates it.
     *
     * @returns {ProfileActivity} The activity instance.
     */
    static getInstance() {

        if (!ProfileActivity._instance)
            ProfileActivity._instance = new ProfileActivity();

        return ProfileActivity._instance;

    }


    /** Opens the activity. */
    open() {

        // Animate the placeholders
        this._placeholders.addClass("ph-animate");

        // Show the screen
        this._screen.show();

        // Get the user's data
        user.get(LoginActivity.getInstance().userId)
            .then(data => {

                // Save the data
                this.userData = data;

                // Display the data
                this.populateProfile();

            })

    }

    /** Closes the activity and resets its fields. */
    close() {

        // Hide the screen
        this._screen.scrollTop(0).hide();

        // Delete the user data
        this.userData = null;

        // Hide the settings icon
        $("#profile-settings").css("visibility", "hidden");

        // Reset the fields
        $("#profile-name").html("");
        $("#mapped-def-number").html("");

        // Reset the profile photo
        $("#profile-photo").attr("src", "img/default-profile-img-120.png");

        // Hide the content
        $("#page--profile .ph-hidden-content").hide();

        // Show the placeholders
        this._placeholders.removeClass("ph-animate").show();

    }


    /** Display the data. */
    populateProfile() {

        // Show the name of the user
        $("#profile-name").html(this.userData.name);

        // Show the number of mapped defibrillators
        $("#mapped-def-number").html(this.userData.defNumber);
        if (this.userData.defNumber === 1) $("#mapped-def-text").html(i18next.t("profile.defMappedSingle"));
        else $("#mapped-def-text").html(i18next.t("profile.defMappedPlural"));


        // Show the settings icon
        $("#profile-settings").css("visibility", "visible");


        // Show the profile image
        if (this.userData.imageUrl !== "") $("#profile-photo").attr("src", `${settings.serverUrl}/${this.userData.imageUrl}`);


        // Hide the placeholders
        this._placeholders.hide().removeClass("ph-animate");

        // Show the content
        $("#page--profile .ph-hidden-content").show();

    }


    /** Initializes the photo menu. */
    initPhotoMenu() {

        // Utility function to close the menu
        const close = () => {

            // Hide the menu
            $("#profile-photo-dialog-overlay").hide();

            // Hide the delete option
            $("#profile-photo-delete").hide();

        };

        // Triggered when the user clicks on the photo preview
        $("#profile-photo").click(() => {

            // If the photo is different from the placeholder, show the option to delete it
            if ($("#profile-photo").attr("src") !== "img/default-profile-img-120.png")
                $("#profile-photo-delete").show();

            // Show the menu
            $("#profile-photo-dialog-overlay").show();

        });

        // Triggered when the user clicks on the "camera" option
        $("#profile-photo-camera").click(() => {

            // Close the menu
            close();

            // Get a new photo from the camera
            this.changePhoto(true);

        });

        // Triggered when the user clicks on the "gallery" option
        $("#profile-photo-gallery").click(() => {

            // Close the menu
            close();

            // Get a new photo from the gallery
            this.changePhoto(false);

        });

        // Triggered when the user clicks on the "delete" option
        $("#profile-photo-delete").click(() => {

            // Open the loader
            utils.openLoader();

            // Close the menu
            close();

            // Create a dialog to aks for user confirmation
            utils.createAlert(
                "",
                i18next.t("profile.photoDialog.deleteConfirmation"),
                i18next.t("dialogs.btnCancel"),
                null,
                i18next.t("dialogs.btnOk"),
                () => {

                    // Delete the picture by calling the method with an empty FormData as parameter
                    user.putProfilePicture(LoginActivity.getInstance().userId, new FormData())
                        .then(() => {

                            // Close the loader
                            utils.closeLoader();

                            // Set the image placeholder
                            $("#profile-photo").attr("src", "img/default-profile-img-120.png");

                        })
                        .catch(() => {

                            // Close the loader
                            utils.closeLoader();

                        })

                }
            );
        });

        // When the user click on the "cancel" button, close the menu
        $("#profile-photo-cancel").click(() => close());

        // ToDO delete
        $("#tmp-profile-photo-input").change(() => {

            let photo = $("#tmp-profile-photo-input")[0].files[0];

            let reader = new FileReader();

            reader.onloadend = e => {

                utils.openLoader();

                const formData = new FormData();

                formData.append("image", photo);


                user.putProfilePicture(LoginActivity.getInstance().userId, formData)
                    .then(url => {

                        utils.closeLoader();

                        $("#profile-photo").attr("src", `${settings.serverUrl}/${url}`);

                    });

            };

            reader.readAsDataURL(photo);

        });


    }

    /**
     * Takes a photo from the camera or the gallery, lets the user crop it and uploads it to the server
     *
     * @param {boolean} fromCamera - True if the photo has to be taken from the camera.
     */
    changePhoto(fromCamera) {

        // ToDo delete
        if (!App.isCordova) {
            $("#tmp-profile-photo-input").click();
            return;
        }

        // Options for the camera plugin
        const opts = {
            quality           : 50,                              // Output quality is 50% of the original photo
            destinationType   : Camera.DestinationType.FILE_URI, // Output as a file uri
            sourceType        : Camera.PictureSourceType.CAMERA, // Take only from the camera (not from the gallery)
            encodingType      : Camera.EncodingType.JPEG,        // Encode the output as jpeg
            mediaType         : Camera.MediaType.PICTURE,        // The output is a picture
            allowEdit         : false,                           // Prevent editing
            correctOrientation: true                             // Automatically correct the orientation of the picture
        };

        // If the flag is false, set the gallery as source
        if (!fromCamera) opts.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;

        // Take the picture
        navigator.camera.getPicture(
            fileURI => {

                // Parse the response
                const res = JSON.parse(fileURI);

                // Save the name of the photo
                let photo = res.filename;

                // If the picture is taken from the gallery on an Android phone, change the path
                if (device.platform === "Android" && !fromCamera) photo = `file://${photo}`;

                // Crop the image
                return plugins.crop.promise(photo)
                    .then(path => {

                        // Open the loader
                        utils.openLoader();

                        // Append the file tho a new FormData
                        utils.appendFile(new FormData(), path)
                            .then(formData => {

                                // Change the image on the server
                                return user.putProfilePicture(LoginActivity.getInstance().userId, formData)

                            })
                            .then(url => {

                                // Close the loader
                                utils.closeLoader();

                                // Change the displayed image
                                $("#profile-photo").attr("src", `${settings.serverUrl}/${url}`);

                            })

                    })
                    .catch(err => {

                        console.error(`Error cropping picture ${err}`);

                        // Alert the user
                        utils.createAlert("", i18next.t("dialogs.pictureError"), i18next.t("dialogs.btnOk"));

                    });
            },
            err => {

                console.error(`Error taking picture ${err}`);

                // Alert the user
                utils.createAlert("", i18next.t("dialogs.pictureError"), i18next.t("dialogs.btnOk"));

            },
            opts);


    }


    /** Initializes the settings menu. */
    initSettingsMenu() {

        // Utility function to open the menu
        const open = () => {

            // Show a transparent overlay
            $("#profile-settings-overlay").show();

            // Show the menu
            $("#profile-settings-menu").show();

        };

        // Utility function to close the menu
        const close = () => {

            // Hide the menu
            $("#profile-settings-menu").hide();

            // Hide the transparent overlay
            $("#profile-settings-overlay").hide();

        };


        // When the user clicks on the "settings" icon, open the menu
        $("#profile-settings").click(() => open());

        // When the user clicks on the the transparent overlay, close the menu
        $("#profile-settings-overlay").click(() => close());


        // Option "change language" // ToDo
        $("#settings-language").click(() => utils.logOrToast("Function not yet implemented", "short"));

        // Option "edit profile"
        $("#settings-editProfile").click(() => {

            // Close the menu
            close();

            // Open the edit profile activity
            utils.switchActivity(EditProfileActivity.getInstance());

        });

        // Option "change email"
        $("#settings-changeEmail").click(() => {

            // Open the change email page
            $("#change-email").show();

            // Close the menu
            close();

        });

        // Option change password
        $("#settings-changePassword").click(() => {

            // Show the screen
            $("#change-pw").show();

            // Close the menu
            close();

        });

        // Option logout
        $("#settings-logout").click(() => {

            // Close the menu
            close();

            // Create a dialog to ask for user confirmation
            utils.createAlert(
                "",
                i18next.t("dialogs.logoutConfirmation"),
                i18next.t("dialogs.btnCancel"),
                null,
                i18next.t("dialogs.btnOk"),
                () => {

                    // Close the profile page
                    this.close();

                    // Close the map activity
                    MapActivity.getInstance().close();

                    // Logout
                    LoginActivity.getInstance().logout();

                    // Open the login activity
                    LoginActivity.getInstance().open();

                }
            );

        });

    }


    /** Initializes the change email menu. */
    initChangeEmail() {

        // Utility function to close the menu
        const close = () => {

            // Hide the screen
            $("#change-email").scrollTop(0).hide();

            // Reset the field
            $("#new-email").val("");

        };

        // When the user click on the "close" button, close the page
        $("#change-email-close").click(() => close());

        // When the user clicks on the "done" button, change the mail
        $("#change-email-done").click(() => {

            // Open the loader
            utils.openLoader();

            // Save the email provided by the user
            const email = $("#new-email").val();

            // If no email has been provided
            if (email === "") {

                // Close the loader
                utils.closeLoader();

                // Alert the user
                utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");

                // Return
                return;

            }

            // Change the email of the user
            user.putEmail(LoginActivity.getInstance().userId, email)
                .then(() => {

                    // Close the loader
                    utils.closeLoader();

                    // Close the menu
                    close();

                    // Close the profile page
                    this.close();

                    // Close the map activity
                    MapActivity.getInstance().close();

                    // Log the user out
                    LoginActivity.getInstance().logout();

                    // Open the login activity
                    LoginActivity.getInstance().open();

                    // Create a confirmation email dialog
                    utils.createAlert(i18next.t("profile.changeEmail.successTitle"), i18next.t("profile.changeEmail.successMessage"), i18next.t("dialogs.btnOk"));

                })

        });


    }


    /** Initializes the change password menu. */
    initChangePw() {

        // Utility function to close the page
        const close = () => {

            // Hide the screen
            $("#change-pw").scrollTop(0).hide();

            // Reset the fields
            resetFields();

        };

        // Utility function to reset the fields
        const resetFields = () => {

            $("#change-pw-old-password").val("");
            $("#change-pw-new-password").val("");
            $("#change-pw-confirm-password").val("");

        };

        // When the user click on the "close" button, close the page
        $("#change-pw-close").click(() => close());

        // When the user clicks on the "done" button, change the password
        $("#change-pw-done").click(() => {

            // Open the loader
            utils.openLoader();

            // Save the values of the fields
            const oldPassword     = $("#change-pw-old-password").val(),
                  newPassword     = $("#change-pw-new-password").val(),
                  confirmPassword = $("#change-pw-confirm-password").val();

            // If no old password is provided, return
            if (oldPassword === "") {
                utils.logOrToast(i18next.t("messages.insertOldPassword"), "long");
                utils.closeLoader();
                return;
            }

            // If the password is too weak (less than 8 characters with no number), return
            if (newPassword === "" || newPassword.length < 8 || !(/\d/.test(newPassword))) {
                utils.logOrToast(i18next.t("messages.weakNewPassword"), "long");
                utils.closeLoader();
                return;
            }

            // If the old password is equal to the new password, return
            if (oldPassword === newPassword) {
                utils.logOrToast(i18next.t("messages.samePassword"), "long");
                utils.closeLoader();
                return;
            }

            // If the fields "new password" and "confirm password" do not match, return
            if (newPassword !== confirmPassword) {
                utils.logOrToast(i18next.t("messages.passwordsNotMatch"), "long");
                utils.closeLoader();
                return;
            }

            // Change the password
            user.putPassword(LoginActivity.getInstance().userId, oldPassword, newPassword, confirmPassword)
                .then(() => {

                    // Close the loader
                    utils.closeLoader();

                    // Close the page
                    close();

                    // Alert the user
                    utils.logOrToast(i18next.t("messages.changePwSuccess"), "long");

                })

        });

    }

}