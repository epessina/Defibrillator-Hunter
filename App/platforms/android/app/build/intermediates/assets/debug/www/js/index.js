"use strict";

const LOCAL_DB         = "dh_local_db";

let isMobile,
    isApp;

let markers = [];

let networkState,
    localDb,
    pointsDB;


// ToDO change for cordova
function onLoad() {
    // document.addEventListener("deviceready", initialize, false);
    initialize();
}


// ToDO change for cordova
function initialize() {

    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);

    ln.init();
}


function onPause() {

    console.log("onPause");
    detachPositionWatcher();

}


function onResume() {

    console.log("onResume");
    attachPositionWatcher();

}


function onResize() {
    $("#map").height($(window).height());
}


// ToDO change for cordova
function init() {

    // isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    isApp = document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1;

    // networkState = navigator.connection.type;

    onResize();
    initMap();
    initDb();

    initInsert();

    getDefibrillators();

}


//ToDo handle connection errors
function initDb() {

    localDb = new PouchDB(LOCAL_DB);

    console.log(isApp);

    if (isApp)
        pointsDB = new PouchDB(HOSTED_POINTS_DB);
    else
        pointsDB = new PouchDB(REMOTE_POINTS_DB);
}


function getDefibrillators() {

    // ToDo
    // if (networkState === Connection.NONE || navigator.onLine === false) {
    //     showAlert("messages.noInternet");
    // }

    pointsDB.allDocs({include_docs: true}, function (err, doc) {

        if (err) {

            showAlert("messages.generalError");
            console.log(err);

        } else {

            doc.rows.forEach(function (row) {

                let defibrillator = new Defibrillator(
                    row.doc._id,
                    row.doc.timeStamp,
                    row.doc.lang,
                    row.doc.position,
                    row.doc.accuracy,
                    row.doc.locationCategory,
                    row.doc.visualReference,
                    row.doc.floor,
                    row.doc.temporalAccessibility,
                    row.doc.recovery,
                    row.doc.signage,
                    row.doc.brand,
                    row.doc.notes,
                    row.doc.presence,
                    ""
                );

                defibrillator.showDefibrillator();

            });

        }
    })

}


function deleteDefibrillator(id) {

    let newMarkers = [];

    markers.forEach(marker => {
        if (marker._id === id)
            map.removeLayer(marker);
        else
            newMarkers.push(marker);
    });

    markers = newMarkers;

    // navigator.notification.confirm(
    //     i18n.t("messages.confirmCancellation"),
    //     onConfirm,
    //     "Defibrillator Hunter",
    //     [i18n.t("messages.yes"), i18n.t("messages.no")]
    // );
    //
    // function onConfirm(btnIndex) {
    //
    //     if (btnIndex === 1) {
    //
    //         pointsDB.get(id).then(function (doc) {
    //             return pointsDB.remove(doc);
    //         }).then(function () {
    //             let newUserMarkers = [];
    //
    //             userMarkers.forEach(function (marker) {
    //                 if (marker._id === markerId) {
    //                     userMarkersLayer.removeLayer(marker);
    //                 } else {
    //                     newUserMarkers.push(marker);
    //                 }
    //             });
    //
    //             userMarkers = newUserMarkers;
    //         }).catch(function (err) {
    //             showAlert("messages.cancelError");
    //             console.log(err);
    //         })
    //     }
    // }

}


// ToDO change for cordova
function showAlert(msg) {

    // navigator.notification.alert(
    //     i18n.t(msg),
    //     null,
    //     "Defibrillator Hunter",
    //     i18n.t("messages.ok")
    // );

    alert(i18n.t(msg));
}