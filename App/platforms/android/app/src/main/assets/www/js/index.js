"use strict";

let backPressedCount = 0;

let isCordova = false;

let $splashScreen = $("#splash"),
    $alertOverlay = $("#alert-dialog-overlay");


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

    // If there is a valid session storage, open the map
    else
        MapActivity.getInstance().open();

    InsertActivity.getInstance().open();

}




function deleteDefibrillator(id) {

    openLoader();

    fetch(serverUrl + "defibrillator/" + id, {
        method : "DELETE",
        headers: {
            "App-Key"    : APIKey,
            Authorization: "Bearer " + token
        }
    })
        .then(res => {

            if (res.status !== 200) {
                const err = new Error();
                err.code  = res.status;
                throw err;
            }

            return res.json();
        })
        .then(() => {

            let new_markers = [];
            markers.forEach(marker => {
                if (marker._id === id)
                    markersLayer.removeLayer(marker);
                else
                    new_markers.push(marker);
            });
            markers = new_markers;

            closeLoader();
            closeInfo();
        })
        .catch(err => {
            console.error(err);

            closeLoader();

            if (err.code === 401)
                createAlertDialog(
                    i18n.t("dialogs.title401"),
                    i18n.t("dialogs.deleteDefibrillator401"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 403)
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 404)
                createAlertDialog(
                    i18n.t("dialogs.title404"),
                    i18n.t("dialogs.deleteDefibrillator404"),
                    i18n.t("dialogs.btnOk"));
            else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.deleteDefibrillator500"),
                    i18n.t("dialogs.btnOk"));
        });
}
