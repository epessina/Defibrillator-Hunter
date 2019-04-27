"use strict";

// let serverUrl = "http://localhost:8080/";
// let serverUrl = "http://192.168.1.103:8080/";
let serverUrl = "https://defibrillator-hunter.herokuapp.com/";

let isCordova,
    isMobile,
    isApp;

let markers = [];

let networkState;


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
    // detachPositionWatcher();

}


function onResume() {

    console.log("onResume");
    // attachPositionWatcher();

}


function onResize() {
    $("#map").height($(window).height());
}


function init() {

    isMobile     = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    isApp        = document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1;
    networkState = navigator.connection.type;

    $("#img-screen-close").click(() => $("#img-screen").hide());

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

    marker.id = id;

    marker.on("click", () => openInfo(id));

    markers.push(marker);
    marker.addTo(map);

}


function showAlert(msg) {

    if (isCordova) {

        navigator.notification.alert(
            i18n.t(msg),
            null,
            "Defibrillator Hunter",
            i18n.t("messages.ok")
        );

    } else {
        alert(i18n.t(msg));
    }

}

function logOrToast(msg) {

    if (!isCordova)
        console.log(msg);
    else
        window.plugins.toast.showShortBottom(msg);

}