"use strict";

/**
 *  Activity to update the user's profile.
 *
 * @author Edoardo Pessina
 */
class EditProfileActivity {

    /** @private */ static _instance;


    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link EditProfileActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        // Cache the screen
        this._screen = $("#page--edit-profile");

        // When the user clicks on th "close" button, switch to the profile activity
        $("#edit-profile-close").click(() => utils.switchActivity(ProfileActivity.getInstance(), true, this));

        // When the user clicks on the "done" button, edit the profile
        $("#edit-profile-done").click(() => this.edit());

        // Change the label of the selectors when their value changes
        $("#edit-profile-age").change(() => utils.changeSelectorLabel("edit-profile-age", true));
        $("#edit-profile-gender").change(() => utils.changeSelectorLabel("edit-profile-gender", true));
        $("#edit-profile-occupation").change(() => utils.changeSelectorLabel("edit-profile-occupation", true));

    }

    /**
     * Returns the current InfoActivity instance if any, otherwise creates it.
     *
     * @returns {EditProfileActivity} The activity instance.
     */
    static getInstance() {

        if (!EditProfileActivity._instance)
            EditProfileActivity._instance = new EditProfileActivity();

        return EditProfileActivity._instance;

    }


    /** Opens the activity. */
    open() {

        // Get the user data from the profile activity
        const data = ProfileActivity.getInstance().userData;

        // Set the values of the fields
        $("#edit-profile-name").val(data.name);

        $("#edit-profile-age").val(data.age);
        utils.changeSelectorLabel("edit-profile-age", true);

        $("#edit-profile-gender").val(data.gender);
        utils.changeSelectorLabel("edit-profile-gender", true);

        $("#edit-profile-occupation").val(data.occupation);
        utils.changeSelectorLabel("edit-profile-occupation", true);

        if (data.isRescuer) $("#edit-profile-rescuer").prop("checked", true);

        // Show the screen
        this._screen.show();

    }

    /** Closes the activity and resets its fields. */
    close() {

        // Hide the screen
        this._screen.scrollTop(0).hide();

        // Reset the fields
        $("#edit-profile-name").val("");

        $("#edit-profile-age").val("");
        utils.changeSelectorLabel("edit-profile-age", true);

        $("#edit-profile-gender").val("");
        utils.changeSelectorLabel("edit-profile-gender", true);

        $("#edit-profile-occupation").val("");
        utils.changeSelectorLabel("edit-profile-occupation", true);

        $("#edit-profile-rescuer").prop("checked", false);

    }


    /** Edit the user profile. */
    edit() {

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
                ProfileActivity.getInstance().userData.name       = data.name;
                ProfileActivity.getInstance().userData.age        = data.age;
                ProfileActivity.getInstance().userData.gender     = data.gender;
                ProfileActivity.getInstance().userData.occupation = data.occupation;
                ProfileActivity.getInstance().userData.isRescuer  = data.isRescuer;

                // Update the profile name in the profile activity
                $("#profile-name").html(data.name);

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

}