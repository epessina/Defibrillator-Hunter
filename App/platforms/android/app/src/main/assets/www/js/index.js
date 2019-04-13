"use strict";

const LOCAL_DB = "dh_local_db";

let isCordova,
    isMobile,
    isApp;

let markers = [];

let networkState,
    localDb,
    pointsDB;


function onLoad() {

    isCordova = window.cordova;

    if (isCordova) {
        console.log("Cordova running");
        document.addEventListener("deviceready", initialize, false);
    } else {
        console.log("Cordova not running");
        initialize();
    }

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

    onResize();
    initMap();
    initDb();
    getDefibrillators();
    initInsert();

    $("#info-close").click(() => closeInfoPage());

}


//ToDo handle connection errors
function initDb() {

    localDb = new PouchDB(LOCAL_DB);

    if (isApp)
        pointsDB = new PouchDB(HOSTED_POINTS_DB);
    else
        pointsDB = new PouchDB(REMOTE_POINTS_DB);
}


// ToDO change for Cordova
function getDefibrillators() {

    // if (networkState === Connection.NONE || navigator.onLine === false) {
    //     showAlert("messages.noInternet");
    //     return;
    // }

    pointsDB.allDocs({include_docs: true}, function (err, doc) {

        if (err) {

            showAlert("messages.generalError");
            console.log(err);

        } else {

            doc.rows.forEach(function (row) {

                let defibrillator = new Defibrillator(
                    row.doc._id,
                    row.doc.creationDate,
                    row.doc.lastModified,
                    row.doc.position,
                    row.doc.accuracy,
                    row.doc.locationCategory,
                    row.doc.transportType,
                    row.doc.visualReference,
                    row.doc.floor,
                    row.doc.temporalAccessibility,
                    row.doc.recovery,
                    row.doc.signage,
                    row.doc.brand,
                    row.doc.notes,
                    row.doc.presence,
                    row.doc.hasPhoto
                );

                defibrillator.show();
            });
        }
    })

}


function closeInfoPage() {

    $("#defibrillator-info").scrollTop(0).hide();

    $("#info-id .info-content").html("");
    $("#info-creation-date .info-content").html("");
    $("#info-last-modified .info-content").html("");
    $("#info-coordinates .info-content").html("");
    $("#info-accuracy .info-content").html("");
    $("#info-presence .info-content").html("");
    $("#info-category .info-content").html("");
    $("#info-visual-reference .info-content").html("");
    $("#info-floor .info-content").html("");
    $("#info-temporal-accessibility .info-content").html("");
    $("#info-recovery .info-content").html("");
    $("#info-signage .info-content").html("");
    $("#info-brand .info-content").html("");
    $("#info-notes .info-content").html("");
    $("#info-photo-preview").attr("src", "img/no-img-placeholder-200.png");

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