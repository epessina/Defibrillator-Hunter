"use strict";

let app;

// ToDo fix
$(() => {

    if (window.cordova) document.addEventListener("deviceready", () => app = new App(), false);

    else app = new App();

});


/**
 *  Main activity of the application. It starts the whole system as soon as the DOM is fully loaded.
 *
 * @author Edoardo Pessina
 */
class App {

    /** Flag that states if the system is using Cordova. */
    static get isCordova() { return window.cordova }; // ToDo delete


    /**
     * Creates and initializes the activity as well as the internationalization service.
     *
     * @constructor
     */
    constructor() {

        // Flag that states if the position watcher has to be reattached after a "pause" event
        this._toReattachPositionWatcher = false;

        // The number of time the back button has been sequentially pressed
        this._backPressedCount = 0;

        // Array with the stack of activities currently open
        this.activityStack = [];


        // Attach the function to be fired when a "pause" or a "resume" event occurs
        document.addEventListener("pause", this.onPause, false);
        document.addEventListener("resume", this.onResume, false);


        // Handle the "back button" click
        if (App.isCordova) {

            // Add a listener for the click of the black button
            document.addEventListener("backbutton", () => this.onBackPressed(), false);

        }


        // Initialize the internationalization service
        i18next
            .use(i18nextXHRBackend)
            .init({
                // debug      : true,
                lng        : "en",
                fallbackLng: "en",
                ns         : "general",
                defaultNS  : "general",
                backend    : { loadPath: "./locales/{{lng}}/{{ns}}.json" }
            })
            .then(() => {

                // Attach the function to be fired when the language is changed
                i18next.on("languageChanged", () => console.log(`lng changed to ${i18next.language}`));

                // ToDo
                // navigator.globalization.getLocaleName(
                //     lang => {
                //         ln.language = lang.value.substring(0, 2);
                //         i18next.setLng(ln.language, () => $("body").i18n());
                //         init();
                //     },
                //     error => console.log(error)
                // );

                // Initialize the jQuery plugin
                jqueryI18next.init(i18next, $);

                // Translate the body
                $("body").localize();

                // Open the first  activity
                this.open();

            });

    }


    /** Defines the behaviour of the back button for the whole application. */
    onBackPressed() {

        // If any loader or alert dialog is open, return
        if (utils.isLoaderOpen || utils.isAlertOpen) return;

        // If the image screen is open
        if (utils.isImgScreenOpen) {

            // Close the image screen
            utils.closeImgScreen();

            // Return
            return;

        }

        // Perform the "onBackPressed" method of the last activity in the stack
        app.activityStack[app.activityStack.length - 1].onBackPressed();

    }


    /** Opens the first activity based on the authentication status. */
    open() {

        // // If there is not a valid session stored, open the login page
        // if (!LoginActivity.getInstance().getAuthStatus()) LoginActivity.getInstance().open();
        //
        // // If there is a valid session in storage, open the map
        // else MapActivity.getInstance().open();

        LoginActivity.getInstance().getAuthStatus();
        ProfileActivity.getInstance().open();

        // Hide the splash screen
        $("#splash").hide();

    }


    /** When the application is paused, it detaches the position watcher. */
    onPause() {

        console.log("onPause");

        // If an instance of MapActivity has already been created
        if (MapActivity.hasInstance()) {

            // If the position watcher was attached before the pause event
            if (MapActivity.getInstance().isPositionWatcherAttached) {

                // Set the flag to true
                app._toReattachPositionWatcher = true;

                // Detach the position watcher
                MapActivity.getInstance().detachPositionWatcher();

            }

        }

    }

    /** When the application is resumed, it re-attaches the position watcher. */
    onResume() {

        console.log("onResume");

        // If the position watcher has to be re-attached
        if (app._toReattachPositionWatcher) {

            // Check if the gps is on and eventually attach the position watcher
            MapActivity.getInstance().checkGPSOn(() => MapActivity.getInstance().attachPositionWatcher());

            // Set the flag to false
            app._toReattachPositionWatcher = false;

        }

    }

}