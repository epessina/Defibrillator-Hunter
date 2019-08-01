"use strict";

let backPressedCount = 0;

let isCordova = false;

let $splashScreen = $("#splash"),
    $alertOverlay = $("#alert-dialog-overlay");

let toReattachPositionWatcher = false;


function onLoad() {

    isCordova = window.cordova;

    if (isCordova)
        document.addEventListener("deviceready", initialize, false);
    else
        initialize();

}

function initialize() {

    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);

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
            i18next.on("languageChanged", () => console.log(`lng changed to ${i18next.language}`));
            jqueryI18next.init(i18next, $);
            $("body").localize();
            init();
        });


}

function onPause() {

    console.log("onPause");

    // If an instance of MapActivity has already been created
    if (MapActivity.hasInstance()) {

        // If the position watcher was attached before the pause event
        if (MapActivity.getInstance().isPositionWatcherAttached) {

            // Set the flag to true
            toReattachPositionWatcher = true;

            // Detach the position watcher
            MapActivity.getInstance().detachPositionWatcher();

        }

    }

}

function onResume() {

    console.log("onResume");

    // If the position watcher has to be re-attached
    if (toReattachPositionWatcher) {

        // Check if the gps is on and eventually attach the position watcher
        MapActivity.getInstance().checkGPSOn(() => MapActivity.getInstance().attachPositionWatcher());

        // Set the flag to false
        toReattachPositionWatcher = false;

    }

}


function init() {

    // ToDo handle properly
    if (isCordova) {

        document.addEventListener(
            "backbutton",
            () => {

                if (backPressedCount === 0) {
                    logOrToast("Press again to leave", "short");
                    backPressedCount++;
                    setInterval(() => backPressedCount = 0, 2000);
                } else
                    navigator.app.exitApp();

            },
            false
        );

    }


    // If there is not a valid session stored, open the login page
    if (!LoginActivity.getInstance().getAuthStatus())
        LoginActivity.getInstance().open();

    // If there is a valid session in storage, open the map
    else
        MapActivity.getInstance().open();

}




function deleteDefibrillator(id) {


}
