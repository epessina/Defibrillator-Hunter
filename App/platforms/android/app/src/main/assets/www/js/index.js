"use strict";

let ln;

let backPressedCount = 0;

let isCordova = false;

let markers = [];

let toReattachPositionWatcher = false;

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


    // ToDo delete
    ln = { language: "en" };

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

    if (isPositionWatcherAttached) {
        toReattachPositionWatcher = true;
        detachPositionWatcher();
    }

}

function onResume() {

    console.log("onResume");

    if (toReattachPositionWatcher) {
        checkGPSOn(() => attachPositionWatcher());
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


    // // If there is not a valid session stored, open the login page
    // if (!LoginActivity.getInstance().getAuthStatus())
    //     LoginActivity.getInstance().open();
    //
    // // If there is a valid session storage, open the map
    // else
        MapActivity.getInstance().open();

}


function getDefibrillators() {

    markers.forEach(marker => markersLayer.removeLayer(marker));
    markers = [];

    fetch(serverUrl + "defibrillator/get-all", {
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
        .then(data => data.defibrillators.forEach(def => showDefibrillator(def._id, def.coordinates)))
        .catch(err => {
            console.error(err);

            if (err.code === 401)
                createAlertDialog(
                    i18n.t("dialogs.title401"),
                    i18n.t("dialogs.getDefibrillators401"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 403)
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
                    i18n.t("dialogs.btnOk"));
            else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.getDefibrillators500"),
                    i18n.t("dialogs.btnOk"));
        });

}


function showDefibrillator(id, coordinates) {

    let marker = L.marker(
        coordinates, {
            icon     : defibrillatorIcon,
            draggable: false
        }
    );

    marker._id = id;

    marker.on("click", () => openInfo(id));

    markers.push(marker);
    markersLayer.addLayer(marker);

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


function appendFile(formData, fileUri, fileName, clbSuccess) {

    window.resolveLocalFileSystemURL(fileUri, fileEntry => {

            fileEntry.file(file => {

                let reader = new FileReader();

                reader.onloadend = function () {
                    let blob = new Blob([new Uint8Array(this.result)], { type: "image/jpeg" });
                    formData.append(fileName, blob);
                    clbSuccess(formData);
                };

                reader.onerror = fileReadResult => {
                    console.error("Reader error", fileReadResult);
                    closeLoader();
                    createAlertDialog("", i18n.t("dialogs.errorAppendPicture"), i18n.t("dialogs.btnOk"));
                };

                reader.readAsArrayBuffer(file);

            }, err => {
                console.error("Error getting the fileEntry file", err);
                closeLoader();
                createAlertDialog("", i18n.t("dialogs.errorAppendPicture"), i18n.t("dialogs.btnOk"));
            })

        }, err => {
            console.error("Error getting the file", err);
            closeLoader();
            createAlertDialog("", i18n.t("dialogs.errorAppendPicture"), i18n.t("dialogs.btnOk"));
        }
    );

}


function openImgScreen(scr, editable = false, clbEdit, clbCancel) {

    $("#img-screen-container img").attr("src", scr);

    $("#img-screen-close").click(() => closeImgScreen());

    if (editable) {

        $("#img-screen-edit")
            .unbind("click")
            .click(() => {
                closeImgScreen();
                clbEdit();
            })
            .parent().show();

        $("#img-screen-delete")
            .show()
            .unbind("click")
            .click(() => {

                createAlertDialog(
                    "",
                    i18n.t("dialogs.photoScreen.deletePictureConfirmation"),
                    i18n.t("dialogs.btnCancel"),
                    null,
                    i18n.t("dialogs.btnOk"),
                    () => {
                        clbCancel();
                        closeImgScreen();
                    }
                );

            })
            .parent().show();

    }

    $("#img-screen").show();

}

function closeImgScreen() {

    $("#img-screen").hide();

    $("#img-screen-container img").attr("src", "");

    $("#img-screen-edit").parent().hide();

    $("#img-screen-delete").parent().hide();

}