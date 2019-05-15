"use strict";

// let serverUrl = "http://localhost:8080/";
let serverUrl = "http://192.168.1.100:8080/";
// let serverUrl = "https://defibrillator-hunter.herokuapp.com/";

let backPressedCount = 0;

let isCordova;

let markers = [];

let networkState;

let toReattachPositionWatcher = false;

let $alertOverlay = $("#alert-dialog-overlay");


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

    networkState = navigator.connection.type;

    onResize();
    initMap();
    getDefibrillators();
    initInsert();
    initInfo();

}


function getDefibrillators() {

    fetch(serverUrl + "defibrillator/get-all")
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
            console.log(err);
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

    fetch(serverUrl + "defibrillator/" + id, { method: "DELETE" })
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
            console.log(err);
        });
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















