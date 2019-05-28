"use strict";

let serverUrl = "http://localhost:8080/";
// let serverUrl = "http://192.168.1.100:8080/";
// let serverUrl = "https://defibrillator-hunter.herokuapp.com/";

let backPressedCount = 0;

let isCordova = false;

let isAuth = false,
    token  = null,
    userId = null;

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

    ln.init();

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

function onResize() {
    $("#map").height($(window).height());
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

    let $authFooter = $(".auth-footer");
    window.addEventListener("keyboardWillShow", () => $authFooter.hide());
    window.addEventListener("keyboardWillHide", () => $authFooter.show());

    onResize();
    initAuth();

    // if (!getAuthStatus()) {
    //     $("#log-in-page").show();
    //     $splashScreen.hide();
    // } else {
    //     $("#map").show();
    //     $splashScreen.hide();
    //     initMap();
    //     getDefibrillators();
    // }

    initProfilePage();
    initInsert();
    initInfo();

}

function getAuthStatus() {

    token            = localStorage.getItem("token");
    const expireDate = localStorage.getItem("expireDate");

    if (!token || !expireDate)
        return false;

    if (new Date(expireDate) <= new Date()) {
        logout();
        return false;
    }

    userId = localStorage.getItem("userId");

    const remainingMilliseconds = new Date(expireDate).getTime() - new Date().getTime();
    setAutoLogout(remainingMilliseconds);

    return true;

}


function getDefibrillators() {

    markers.forEach(marker => markersLayer.removeLayer(marker));
    markers = [];

    fetch(serverUrl + "defibrillator/get-all", {
        headers: {
            Authorization: "Bearer " + token
        }
    })
        .then(res => {
            if (res.status !== 200) {
                throw new Error("Failed to fetch defibrillators");
            }
            return res.json();
        })
        .then(data => {
            data.defibrillators.forEach(def => showDefibrillator(def._id, def.coordinates))
        })
        .catch(err => {
            createAlertDialog(i18n.t("dialogs.errorGetDefibrillators"), i18n.t("dialogs.btnOk"));
            console.error(err);
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

    fetch(serverUrl + "defibrillator/" + id, {
        method : "DELETE",
        headers: {
            Authorization: "Bearer " + token
        }
    })
        .then(res => {
            if (res.status !== 200) {
                throw new Error("Failed to delete the defibrillator");
            }
            return res.json();
        })
        .then(data => {
            let new_markers = [];
            markers.forEach(marker => {
                if (marker._id === id)
                    markersLayer.removeLayer(marker);
                else
                    new_markers.push(marker);
            });
            markers = new_markers;

            closeInfo();
        })
        .catch(err => {
            createAlertDialog(i18n.t("dialogs.errorDeleteDefibrillator"), i18n.t("dialogs.btnOk"));
            console.error(err);
        });
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


function changeSelectorLabel(selectorId, changeColor = false) {

    let $selector = $("#" + selectorId),
        $label    = $("[for='" + selectorId + "'").find(".label-description");

    if ($selector.val() === "none") {
        $label.html(i18n.t("selectors." + selectorId + "DefLabel"));

        if (changeColor)
            $label.css("color", "#757575");
    } else {
        $label.html($selector.find("option:selected").text());

        if (changeColor)
            $label.css("color", "#000000");
    }

}

function resetSelector(selectorId) {

    $("#" + selectorId).get(0).selectedIndex = 0;
    changeSelectorLabel(selectorId);

}


/**
 * Creates and display a new alert dialog with a message and up to two buttons.
 * It must be passed the text of the buttons (a null value means that there is no button) and a callback function to be
 * executed when the buttons are clicked (a null value means no callback).
 *
 * @param msg: the message to display.
 * @param btn1: the text of the first button.
 * @param clbBtn1: the function to call when the first button is clicked.
 * @param btn2: the text of the second button.
 * @param clbBtn2: the function to call when the second button is clicked.
 */
function createAlertDialog(msg, btn1, clbBtn1 = null, btn2 = null, clbBtn2 = null) {

    $alertOverlay.find(".dialog-text").html(msg);

    $("#alert-first-button")
        .html(btn1)
        .unbind("click")
        .click(() => {
            closeAlertDialog();
            if (clbBtn1)
                clbBtn1();
        });

    if (btn2) {

        $("#alert-second-button")
            .show()
            .html(btn2)
            .unbind("click")
            .click(() => {
                closeAlertDialog();
                if (clbBtn2)
                    clbBtn2();
            });

    }

    $alertOverlay.find(".dialog-wrapper").show();
    $alertOverlay.show();

}

function closeAlertDialog() {

    $alertOverlay
        .hide()
        .children(".dialog-text").html("");

    $("#alert-second-button").hide();

    $alertOverlay.find(".dialog-wrapper").hide();

}


function openLoader() {

    $alertOverlay.find(".spinner-wrapper").show();

    $alertOverlay.show();

}

function closeLoader() {

    $alertOverlay.hide();

    $alertOverlay.find(".spinner-wrapper").hide();

}


function logOrToast(msg, duration) {

    if (!isCordova) {
        console.log(msg);
        return;
    }

    window.plugins.toast.show(msg, duration, "bottom");

}