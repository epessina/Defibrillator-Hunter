"use strict";

/**
 *  Activity to login into the application through OAuth 2.0 protocol.
 *
 * @author Edoardo Pessina
 */
class LoginActivity {

    /** @private */ static _instance;

    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link LoginActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        this.screen = $("#page--log-in");

        // Token and user id of the current user
        this.token  = null;
        this.userId = null;

        // Hide the footer in this and in the register activity when the phone keyboard is shown
        let $authFooter = $(".auth-footer");
        window.addEventListener("keyboardWillShow", () => $authFooter.hide());
        window.addEventListener("keyboardWillHide", () => $authFooter.show());

        // Link to open the reset password activity
        $("#link--reset-password").click(() => utils.switchActivity(ResetPasswordActivity.getInstance()));

        // Button to perform the login
        $("#btn--login").click(() => this.login());

        // Link to open the register activity
        $("#link--register").click(() => utils.switchActivity(RegisterActivity.getInstance(), true, this));

    }

    /**
     * Returns the current LoginActivity instance if any, otherwise creates it.
     *
     * @returns {LoginActivity} The activity instance.
     */
    static getInstance() {

        if (!LoginActivity._instance)
            LoginActivity._instance = new LoginActivity();

        return LoginActivity._instance;

    }


    /** Opens the activity. */
    open() { this.screen.show() }

    /** Closes the activity and resets its fields. */
    close() {
        this.screen.scrollTop(0).hide();

        $("#field--login-email").val("");
        $("#field--login-password").val("");
    }


    /**
     * Checks if there is a valid session stores.
     *
     * @returns {boolean} True if there is a valid session stored.
     */
    getAuthStatus() {

        // Extract the token and the expire date from localStorage
        const token      = localStorage.getItem("token"),
              expireDate = localStorage.getItem("expireDate");

        // If there is no token or expire date, return false
        if (!token || !expireDate) return false;

        // If the token is expired, logout and return false
        if (new Date(expireDate) <= new Date()) {
            this.logout();
            return false;
        }

        // Save the token and the user id
        this.token  = token;
        this.userId = localStorage.getItem("userId");

        // Set the auto logout
        this.setAutoLogout(new Date(expireDate).getTime() - new Date().getTime());

        return true;

    }


    /** Login into the application. */
    login() {

        // Open the loader
        utils.openLoader();

        // Save the value of the fields
        const email    = $("#field--login-email").val(),
              password = $("#field--login-password").val();

        // If no email or password have been provided, flash an error message
        if (email === "" || password === "") {
            utils.closeLoader();
            utils.logOrToast(i18next.t("messages.validCredentials"), "long");
            return;
        }

        // Send a request to the server to login the user
        fetch(
            `${settings.serverUrl}/auth/login`,
            {
                method : "POST",
                headers: { "App-Key": settings.APIKey, "Content-Type": "application/json" },
                body   : JSON.stringify({ email: email, password: password })
            }
        )
            .then(res => {

                // If the server responds with something over than 200 (success), throw an error
                if (res.status !== 200) {
                    const err = new Error();
                    err.code  = res.status;
                    throw err;
                }

                // Parse the json response
                return res.json();

            })
            .then(resData => {

                // Save the token and the id of the user
                this.token  = resData.token;
                this.userId = resData.userId;
                localStorage.setItem("token", resData.token);
                localStorage.setItem("userId", resData.userId);

                // Calculate the session expiration date (1 day)
                const remainingMilliseconds = 24 * 60 * 60 * 1000,
                      expireDate            = new Date(new Date().getTime() + remainingMilliseconds);

                // Save the expiration date and set the auto-logout
                localStorage.setItem("expireDate", expireDate.toISOString());
                this.setAutoLogout(remainingMilliseconds);

                // Open the map activity
                utils.switchActivity(MapActivity.getInstance(), true, this);

                // if (!hasLoggedOut)
                //     initMap();
                // getDefibrillators();

                // Close the page and the loader
                // closeLoginPage();
                utils.closeLoader();

            })
            .catch(err => {

                console.error(err);

                // Reset the password fields
                $("#field--login-password").val("");

                // Close the loader
                utils.closeLoader();

                // Alert the user of the error
                switch (err.code) {

                    // Wrong email or password
                    case 401:
                        utils.logOrToast(i18next.t("messages.login401"), "long");
                        break;

                    // Forbidden (api key not recognized)
                    case 403:
                        utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
                        break;

                    // Email not confirmed
                    case 460:
                        this.createResendEmailDialog();
                        break;

                    // Generic server error
                    default:
                        utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.login500"), i18next.t("dialogs.btnOk"));
                        break;

                }

            });

    }


    /** Create a dialog to give the user the possibility to resend the confirmation email. */
    createResendEmailDialog() {

        // Cache the dom element
        const $alertOverlay = $("#alert-dialog-overlay");

        // Set the dialog title
        $alertOverlay.find(".dialog-title").html(i18next.t("auth.login.notVerifiedTitle"));

        // Set the dialog text
        $alertOverlay.find(".dialog-text").html(`
            <p>${i18next.t("auth.login.notVerifiedMessage")}</p>
            <p class="dialog-link" onclick="LoginActivity.getInstance().resendConfirmationEmail()">
                ${i18next.t("auth.login.resendEmailLink")}
            </p>
        `);

        // Set the close button
        $("#alert-first-button")
            .html(i18next.t("dialogs.btnOk"))
            .unbind("click")
            .click(() => utils.closeAlert());

        // Show the dialog
        $alertOverlay.find(".dialog-wrapper").show();
        $alertOverlay.show();

    }

    /** Re-sends the email to confirm the user's email address.*/
    resendConfirmationEmail() {

        // Close the dialog
        utils.closeAlert();

        // Open the loader
        utils.openLoader();

        // Save the value of the fields
        const email = $("#field--login-email").val();

        // If no email has been provided, flash an error message
        if (email === "") {
            utils.closeLoader();
            utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
            return;
        }

        // Send a request to the server
        fetch(
            `${settings.serverUrl}/auth/confirmation/resend`,
            {
                method : "POST",
                headers: { "App-Key": settings.APIKey, "Content-Type": "application/json", },
                body   : JSON.stringify({ email: email })
            }
        )
            .then(res => {

                // If the server responds with something over than 201 (resource created), throw an error
                if (res.status !== 201) {
                    const err = new Error();
                    err.code  = res.status;
                    throw err;
                }

                // Close the loader
                utils.closeLoader();

                // Show a success dialog
                utils.createAlert(
                    i18next.t("auth.login.resendEmailSuccessTitle"),
                    i18next.t("auth.register.successMessage"),
                    i18next.t("dialogs.btnOk")
                );

            })
            .catch(err => {

                console.error(err);

                // Close the loader
                utils.closeLoader();

                // Alert the user of the error
                switch (err.code) {

                    // Forbidden (api key not recognized)
                    case 403:
                        utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
                        break;

                    // User not found
                    case 404:
                        utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.resendConfEmail404"), i18next.t("dialogs.btnOk"));
                        break;

                    // Email already confirmed
                    case 409:
                        utils.createAlert(i18next.t("dialogs.titleResendConfEmail409"), i18next.t("dialogs.resendConfEmail409"), i18next.t("dialogs.btnOk"));
                        break;

                    // Wrong input data
                    case 422:
                        utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
                        break;

                    // Generic server error
                    default:
                        utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.resendConfEmail500"), i18next.t("dialogs.btnOk"));
                        break;

                }

            });

    }


    /** Logout from the application. */
    logout() {

        // Set token and user id to null
        this.token  = null;
        this.userId = null;

        // Remove token, user id and token expiration date from the localstorage
        localStorage.removeItem("token");
        localStorage.removeItem("expireDate");
        localStorage.removeItem("userId");

    }

    /**
     * Sets a timer to automatically logout the user.
     *
     * @param {number} milliseconds - The time after which the function is called.
     */
    setAutoLogout(milliseconds) {

        setTimeout(() => {

            // ToDO handle

            this.logout();

        }, milliseconds);

    }

}