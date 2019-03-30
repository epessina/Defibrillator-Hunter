"use strict";

const LOCAL_DB         = "dh_local_db";
const REMOTE_POINTS_DB = "http://localhost:5984/dh_points"; // https://couchdb-7167f1.smileupps.com/dh_defibrillators

let isMobile = true,
    isApp    = true;

let DefibrillatorIcon = L.Icon.extend({
    options: {
        iconSize   : [31, 42],
        iconAnchor : [16, 42],
        popupAnchor: [0, -43]
    }
});

// ToDO change for cordova (add www in front)
let userDefibrillatorIcon  = new DefibrillatorIcon({iconUrl: "img/user-def-icon.png"}),
    otherDefibrillatorIcon = new DefibrillatorIcon({iconUrl: "img/other-def-icon.png"});

let userDefibrillators  = [],
    otherDefibrillators = [],
    userMarkers         = [],
    otherMarkers        = [],
    allMarkersLayer,
    userMarkersLayer,
    otherMarkersLayer;

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
    // document.addEventListener("pause", onPause, false);
    // document.addEventListener("resume", onResume, false);
    ln.init();
}


function onPause() {
    console.log("onPause");
}


function onResume() {
    console.log("onResume");
}


function onResize() {
    $("#map").height($(window).height());
}


// ToDO change for cordova
function init() {

    // isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    // isApp    = document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1;

    // networkState = navigator.connection.type;

    onResize();
    initMap();
    // initDb();

    initInsert();

}


//ToDo handle connection errors
function initDb() {

    localDb  = new PouchDB(LOCAL_DB);
    pointsDB = new PouchDB(REMOTE_POINTS_DB);

    // retrieveDefibrillators();
}


function cancelDefibrillator(id, markerId) {

    navigator.notification.confirm(
        i18n.t("messages.confirmCancellation"),
        onConfirm,
        "Defibrillator Hunter",
        [i18n.t("messages.yes"), i18n.t("messages.no")]
    );

    function onConfirm(btnIndex) {

        if (btnIndex === 1) {

            pointsDB.get(id).then(function (doc) {
                return pointsDB.remove(doc);
            }).then(function () {
                let newUserMarkers = [];

                userMarkers.forEach(function (marker) {
                    if (marker._id === markerId) {
                        userMarkersLayer.removeLayer(marker);
                    } else {
                        newUserMarkers.push(marker);
                    }
                });

                userMarkers = newUserMarkers;
            }).catch(function (err) {
                showAlert("messages.cancelError");
                console.log(err);
            })
        }
    }
}


// ToDO change for cordova
function retrieveDefibrillators() {

    // if (networkState === Connection.NONE || navigator.onLine === false) {
    if (false) {
        showAlert("messages.noInternet");
    } else {
        pointsDB.allDocs({include_docs: true}, function (err, doc) {
            if (err) {
                showAlert("messages.generalError");
                console.log(err);
            } else {
                otherDefibrillators = [];
                userDefibrillators  = [];

                doc.rows.forEach(function (row) {

                    if (row.doc.location != null) {
                        let defibrillator = {
                            _id          : row.doc._id,
                            user         : row.doc.user,
                            location     : row.doc.location,
                            accessibility: row.doc.accessibility,
                            comment      : row.doc.comment
                        };

                        if (defibrillator.user === uuid) {
                            userDefibrillators.push(defibrillator);
                        } else {
                            otherDefibrillators.push(defibrillator);
                        }
                    }
                });

                allMarkersLayer = displayDefibrillators();
            }
        })
    }
}


function displayDefibrillators() {

    let allMarkersLayer = L.markerClusterGroup();

    userMarkers  = [];
    otherMarkers = [];

    // User's markers
    for (let i = 0; i < userDefibrillators.length; i++) {
        createUserMarker(userDefibrillators[i]);
    }

    // Other users' markers
    for (let i = 0; i < otherDefibrillators.length; i++) {

        let def = otherDefibrillators[i];

        let marker = L.marker(def.location, {
            icon     : otherDefibrillatorIcon,
            draggable: false
        });

        marker.bindPopup(createMarkerPopup(def));

        otherMarkers.push(marker);
    }

    userMarkersLayer  = L.featureGroup.subGroup(allMarkersLayer, userMarkers);
    otherMarkersLayer = L.featureGroup.subGroup(allMarkersLayer, otherMarkers);

    allMarkersLayer.addTo(map);
    userMarkersLayer.addTo(map);
    otherMarkersLayer.addTo(map);

    // controlLayers.addOverlay(userMarkersLayer,
    //     "<img src='../img/user-def-icon.png' height='24' alt=''>  " + i18n.t("overlays.userMarkers")); // ToDo Fix
    // controlLayers.addOverlay(otherMarkersLayer,
    //     "<img src='../img/other-def-icon.png' height='24' alt=''>  " + i18n.t("overlays.otherMarkers"));

    return allMarkersLayer;
}


function createUserMarker(def) {

    let markerId;

    if (userMarkers.length < 1) {
        markerId = 0;
    } else {
        markerId = userMarkers[userMarkers.length - 1]._id + 1;
    }

    let marker = L.marker(def.location, {
        icon     : userDefibrillatorIcon,
        draggable: false
    });
    marker._id = markerId;

    let popup = L.popup();

    popup.setContent(
        createMarkerPopup(def) +
        "<br>" +
        "<button id='" + def._id + "'" +
        "        class='btn-popup' " +
        "        onclick='cancelDefibrillator(this.id" + ", " + markerId + ")'>" +
        i18n.t("messages.btnCancel") +
        "</button>"
    );

    marker.bindPopup(popup);

    userMarkers.push(marker);

    return marker;
}


function createMarkerPopup(def) {

    return "<p><b>" + i18n.t("popup.id") + "</b>" + def._id + "</p>" +
        "<p><b>" + i18n.t("popup.location") + "</b>" + def.location + "</p>" +
        "<p><b>" + i18n.t("popup.accessibility") + "</b>" + def.accessibility + "</p>" +
        "<p><b>" + i18n.t("popup.comment") + "</b>" + def.comment + "</p>";

}


function displayNewDefibrillator(def) {

    let marker = createUserMarker(def);
    userMarkersLayer.addLayer(marker);
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