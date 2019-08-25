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

        // Cache the placeholders adn the content they hide
        this._placeholders  = $("#page--profile .placeholder");
        this._hiddenContent = $("#page--profile .ph-hidden-content");

        // Variable to save the data of the current user
        this.userData = null;

        // Flags that states what is open
        this._isPhotoMenuOpen = false;
        this._openedSetting   = null;


        // Initialize the ui
        this.initUi();

        // Initialize the photo menu
        this.initPhotoMenu();

        // Initialize the "account" setting user interface
        this.initAccountUi();

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

        // Push the activity into the stack
        utils.pushStackActivity(this);

        // Show the screen
        this._screen.show();

        // Populate the profile
        this.populateProfile();

    }

    /** Closes the activity and resets its fields. */
    close() {

        // Pop the activity from the stack
        utils.popStackActivity();

        // Hide the screen
        this._screen.scrollTop(0).hide();

        // Delete the user data
        this.userData = null;

        // Hide the settings icon
        $("#profile-update").css("visibility", "hidden");

        // Reset the fields
        $("#profile-name").html("");
        $("#profile-email").html("");
        $("#mapped-def-number").html("");
        $("#points-number").html("");
        $("#position-number").html("");

        // Reset the profile photo
        $("#profile-photo").attr("src", "img/default-profile-img-120.png");

        // Reset the flags
        this._isPhotoMenuOpen = false;
        this._openedSetting   = null;

        // Hide the content
        $("#page--profile .ph-hidden-content").hide();

        // Show the placeholders
        this._placeholders.removeClass("ph-animate").show();

    }

    /** Defines the behaviour of the back button for this activity */
    onBackPressed() {

        // If the photo menu is open
        if (this._isPhotoMenuOpen) {

            // Close the menu
            this.closePhotoMenu();

            // Return
            return;

        }

        // If a setting is open
        if (this._openedSetting) {

            // Close the setting
            this.closeSetting(this._openedSetting);

            // Return
            return;

        }

        // Close the activity
        this.close();

    }


    /** Initializes the user interface of the activity. */
    initUi() {

        // When the user clicks on the "close" button, close the activity
        $("#profile-back").click(() => this.close());

        // Fired when the user clicks on the update icon, repopulate the profile
        $("#profile-update").click(() => this.populateProfile());

        // Fired when the user clicks on the account setting
        $("#settings-account-wrapper").click(() => {

            // Show the page
            $("#page--account-settings").show();

            // Set the opened setting name
            this._openedSetting = "account";

        });

        // Fired when the user clicks on the leaderboard setting
        $("#settings-leaderboard-wrapper").click(() => {

            utils.logOrToast(i18next.t("profile.settings.notImplemented"), "long");

        });

        // Fired when the user clicks on the language setting
        $("#settings-language-wrapper").click(() => {

            utils.logOrToast(i18next.t("profile.settings.notImplemented"), "long");

        });

        // Fired when the user clicks on the help setting
        $("#settings-help-wrapper").click(() => {

            utils.logOrToast(i18next.t("profile.settings.notImplemented"), "long");

        });

    }

    /** Display the data. */
    populateProfile() {

        // Hide the content
        this._hiddenContent.hide();

        // Animate the placeholders
        this._placeholders.addClass("ph-animate");

        // Get the user's data
        user.get(LoginActivity.getInstance().userId)
            .then(data => {

                // Save the data
                this.userData = data;

                // Show the settings icon
                $("#profile-update").css("visibility", "visible");

                // Show the profile image
                if (this.userData.imageUrl !== "")
                    $("#profile-photo").attr("src", `${settings.serverUrl}/${this.userData.imageUrl}`);

                // Show the name of the user
                $("#profile-name").html(this.userData.name);

                // Show the mail of the user
                $("#profile-email").html(this.userData.email);

                // Show the points
                $("#mapped-def-number").html(this.userData.defNumber);
                $("#points-number").html(this.userData.points);
                $("#position-number").html("3/260");

                // Hide the placeholders
                this._placeholders.hide().removeClass("ph-animate");

                // Show the content
                $("#page--profile .ph-hidden-content").show();

            })
            .catch(() => {

                // Close the activity
                this.close();

            });

    }


    /** Initializes the photo menu. */
    initPhotoMenu() {

        // Triggered when the user clicks on the photo preview
        $("#profile-photo").click(() => {

            // If the photo is different from the placeholder, show the option to delete it
            if ($("#profile-photo").attr("src") !== "img/default-profile-img-120.png")
                $("#profile-photo-delete").show();

            // Show the menu
            $("#profile-photo-dialog-overlay").show();

            this._isPhotoMenuOpen = true;

        });

        // Triggered when the user clicks on the "camera" option
        $("#profile-photo-camera").click(() => {

            // Close the menu
            this.closePhotoMenu();

            // Get a new photo from the camera
            this.changePhoto(true);

        });

        // Triggered when the user clicks on the "gallery" option
        $("#profile-photo-gallery").click(() => {

            // Close the menu
            this.closePhotoMenu();

            // Get a new photo from the gallery
            this.changePhoto(false);

        });

        // Triggered when the user clicks on the "delete" option
        $("#profile-photo-delete").click(() => {

            // Open the loader
            utils.openLoader();

            // Close the menu
            this.closePhotoMenu();

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
        $("#profile-photo-cancel").click(() => this.closePhotoMenu());

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

    closePhotoMenu() {

        this._isPhotoMenuOpen = false;

        // Hide the menu
        $("#profile-photo-dialog-overlay").hide();

        // Hide the delete option
        $("#profile-photo-delete").hide();

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


    /** Initializes the user interface of the screen of the account setting. */
    initAccountUi() {

        // When the user clicks on the "close" button, close the setting
        $("#account-close").click(() => this.closeSetting("account"));

        // When the user clicks on the edit profile setting
        $("#account-edit-profile").click(() => {

            // Set the values of the fields
            $("#edit-profile-name").val(this.userData.name);

            $("#edit-profile-age").val(this.userData.age);
            utils.changeSelectorLabel("edit-profile-age", true);

            $("#edit-profile-gender").val(this.userData.gender);
            utils.changeSelectorLabel("edit-profile-gender", true);

            $("#edit-profile-occupation").val(this.userData.occupation);
            utils.changeSelectorLabel("edit-profile-occupation", true);

            if (this.userData.isRescuer) $("#edit-profile-rescuer").prop("checked", true);

            // Show the page
            $("#page--edit-profile").show();

            // Set the opened setting name
            this._openedSetting = "editProfile";

        });

        // When the user clicks on the change mail setting, show the page
        $("#account-change-mail").click(() => {

            // Show the screen
            $("#change-email").show();

            // Set the opened setting name
            this._openedSetting = "changeEmail";

        });

        // When the user clicks on the change password setting, show the page
        $("#account-change-pw").click(() => {

            // Show the screen
            $("#change-pw").show();

            // Set the opened setting name
            this._openedSetting = "changePassword";

        });

        // Fired when the user clicks on the logout setting
        $("#account-logout").click(() => {

            // Create a dialog to ask for user confirmation
            utils.createAlert(
                "",
                i18next.t("profile.settings.account.logoutConfirmation"),
                i18next.t("dialogs.btnCancel"),
                null,
                i18next.t("dialogs.btnOk"),
                () => {

                    // Close the screen
                    $("#page--account-settings").scrollTop(0).hide();

                    // Logout
                    this.logout();

                }
            );

        });


        // Initialize the change email page
        this.initChangeEmail();

        // Initialize the change password page
        this.initChangePw();

        // Initialize the change edit profile page
        this.initEditProfile();

    }


    /** Initializes the change email page. */
    initChangeEmail() {

        // When the user click on the "close" button, close the page
        $("#change-email-close").click(() => this.closeSetting("changeEmail"));

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
                    this.closeSetting("changeEmail");

                    // Close the account settings page
                    $("#page--account-settings").scrollTop(0).hide();

                    // Logout
                    this.logout();

                    // Create a confirmation email dialog
                    utils.createAlert(
                        i18next.t("profile.settings.account.changeEmail.successTitle"),
                        i18next.t("profile.settings.account.changeEmail.successMessage"),
                        i18next.t("dialogs.btnOk")
                    );

                })

        });

    }


    /** Initializes the change password page. */
    initChangePw() {

        // When the user click on the "close" button, close the page
        $("#change-pw-close").click(() => this.closeSetting("changePassword"));

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
                    this.closeSetting("changePassword");

                    // Alert the user
                    utils.logOrToast(i18next.t("messages.changePwSuccess"), "long");

                })

        });

    }


    /** Initializes the edit profile page. */
    initEditProfile() {

        // When the user clicks on th "close" button, switch to the profile activity
        $("#edit-profile-close").click(() => this.closeSetting("editProfile"));

        // When the user clicks on the "done" button, edit the profile
        $("#edit-profile-done").click(() => {

            // Open the loader
            utils.openLoader();

            // Save the values of the fields
            const name       = $("#edit-profile-name").val(),
                  age        = $("#edit-profile-age").val(),
                  gender     = $("#edit-profile-gender").val(),
                  occupation = $("#edit-profile-occupation").val(),
                  isRescuer  = $("#edit-profile-rescuer").prop("checked");

            // If no name has been provided, return
            if (name === "") {
                utils.logOrToast(i18next.t("messages.mandatoryName"), "long");
                utils.closeLoader();
                return;
            }

            // Send a request to edit the profile
            user.putProfile(
                LoginActivity.getInstance().userId,
                JSON.stringify({
                    name      : name,
                    age       : age,
                    gender    : gender,
                    occupation: occupation,
                    isRescuer : isRescuer
                })
            )
                .then(data => {

                    // Updated the data saved in the profile activity
                    ProfileActivity.getInstance().userData = data;

                    // Update the profile name in the profile activity
                    $("#profile-name").html(data.name);

                    // Close the loader
                    utils.closeLoader();

                    // Close the page
                    this.closeSetting("editProfile");

                    // Alert the user
                    utils.logOrToast(i18next.t("messages.editProfileSuccess"), "long");

                });

        });

        // Change the label of the selectors when their value changes
        $("#edit-profile-age").change(() => utils.changeSelectorLabel("edit-profile-age", true));
        $("#edit-profile-gender").change(() => utils.changeSelectorLabel("edit-profile-gender", true));
        $("#edit-profile-occupation").change(() => utils.changeSelectorLabel("edit-profile-occupation", true));

    }


    /**
     * Closes a setting.
     *
     * @param {string} name - The name of the setting to close.
     */
    closeSetting(name) {

        // Switch on the name
        switch (name) {

            case "account":

                // Hide the screen
                $("#page--account-settings").scrollTop(0).hide();

                // Set the opened setting to null
                this._openedSetting = null;

                break;

            case "editProfile":

                // Hide the screen
                $("#page--edit-profile").scrollTop(0).hide();

                // Reset the fields
                $("#edit-profile-name").val("");

                $("#edit-profile-age").val("");
                utils.changeSelectorLabel("edit-profile-age", true);

                $("#edit-profile-gender").val("");
                utils.changeSelectorLabel("edit-profile-gender", true);

                $("#edit-profile-occupation").val("");
                utils.changeSelectorLabel("edit-profile-occupation", true);

                $("#edit-profile-rescuer").prop("checked", false);

                // Set the opened setting to "account"
                this._openedSetting = "account";

                break;

            case "changeEmail":

                // Hide the screen
                $("#change-email").scrollTop(0).hide();

                // Reset the field
                $("#new-email").val("");

                // Set the opened setting to "account"
                this._openedSetting = "account";

                break;

            case "changePassword":

                // Hide the screen
                $("#change-pw").scrollTop(0).hide();

                // Reset the fields
                $("#change-pw-old-password").val("");
                $("#change-pw-new-password").val("");
                $("#change-pw-confirm-password").val("");

                // Set the opened setting to "account"
                this._openedSetting = "account";

                break;

        }


    }


    /** Closes the activities and logs out form the application. */
    logout() {

        // Close the activity
        this.close();

        // Close the map activity
        MapActivity.getInstance().close();

        // Logout
        LoginActivity.getInstance().logout();

        // Open the login activity
        LoginActivity.getInstance().open();

    }

}