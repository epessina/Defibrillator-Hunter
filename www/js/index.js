"use strict";

const LOCAL_DB_NAME = "dh_local_db";
const REMOTE_DB_URL = "http://localhost:5984/dh_points";

const POSITION_MARKER_ICON = L.icon({
    iconUrl    : "www/img/position-marker-icon.png",
    iconSize   : [54, 85],
    iconAnchor : [27, 97],
    popupAnchor: [0, -85]
});

const USER_DEFIBRILLATOR_ICON = L.icon({
    iconUrl  : "www/img/user-marker-icon.png",
    shadowUrl: "www/img/marker-shadow.png"
});

const OTHER_DEFIBRILLATOR_ICON = L.icon({
    iconUrl  : "www/img/marker-icon.png",
    shadowUrl: "www/img/marker-shadow.png"
});

let isMobile,
    isApp;

let $mainPage = $("#main-page");

let $menuButton    = $("#nav-button"),
    $menuWrapper   = $("#nav-wrapper"),
    $menuOverlay   = $("#nav-overlay"),
    isMenuOpen     = false,
    isMenuDisabled = false;

let $map = $("#map"),
    map,
    controlLayers;

let osm,
    bing;

let $btnInsert = $("#btn-insert"),
    modalComment,
    modalAccessibility,
    modalPhoto;

let currLatLong = [0, 0],
    defaultZoom = 3;

let positionMarker;

let locationWatcher,
    countLocationPopup = 0;

let uuid;

let userDefibrillators  = [],
    otherDefibrillators = [],
    userMarkers         = [],
    otherMarkers        = [],
    allMarkersLayer,
    userMarkersLayer,
    otherMarkersLayer;

let networkState,
    localDb,
    remoteDB;


let baseMaps,
    overlayMaps = {};


/**
 * Called when the DOM is loaded. It attaches a "deviceready" event listener to the document that signals when Cordova's
 * device APIs have loaded and are ready to access.
 *
 * When the event is fired, it calls the function _initialize_.
 */
function onLoad() {
    document.addEventListener("deviceready", initialize, false);
}

/**
 * Called when Cordova's device APIs have loaded. It calls the _init_ function of the variable **ln** declared in
 * _ln.js_.
 */
function initialize() {
    ln.init();
}

/**
 * Called when the window is resized.
 */
function onResize() {
    console.log("onResize() called");

    $map.height($(window).height() - $map.offset().top);
    adjustLegend();
    // adjustGuidelinesList();
}

function init() {

    isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    isApp    = document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1;

    // Find the unique identifier of the user
    uuid = device.uuid;
    if (uuid === null)
        uuid = new Fingerprint().get().toString() + "-PC";

    networkState = navigator.connection.type;

    $mainPage.show();
    $("body").css("overflow-y", "hidden");

    initMenu();
    initDefibrillatorModals();

    onResize();

    renderMap();

    locationWatcher = setInterval(getUserPosition, 4000);

    handleDb();

}

function initMenu() {

    $menuWrapper.click(function (e) {
        e.stopPropagation();
    });

    $menuButton.click(function (e) {
        e.stopPropagation();

        if (!isMenuOpen)
            openMenu();
        else
            closeMenu();
    });

    document.addEventListener('click', closeMenu);

    $btnInsert.click(function () {

        closeMenu();
        isMenuDisabled = true;

        modalComment.open();

    });
}

function openMenu() {
    isMenuOpen = true;

    $menuButton.html("-");
    $menuOverlay.addClass("on-overlay");
    $menuWrapper.addClass("nav-open");
}

function closeMenu() {
    isMenuOpen = false;

    $menuButton.html("+");
    $menuOverlay.removeClass("on-overlay");
    $menuWrapper.removeClass("nav-open");
}

function initDefibrillatorModals() {

    let modalOptions = {
        minWidth    : 500,
        minHeight   : 324,
        position    : {x: "center", y: "center"},
        closeOnEsc  : false,
        closeOnClick: false,
        closeButton : "box",
        overlay     : false,
        animation   : {open: "move:right", close: "move:left"},
        fade        : false,
        ignoreDelay : true,
        onClose     : function () {
            isMenuDisabled = false;
        }
    };

    modalComment       = new jBox('Modal', modalOptions).setContent($("#modal-comment-content"));
    $("#modal-text-area").prop("placeholder", i18n.t("modals.placeholder"));
    modalAccessibility = new jBox('Modal', modalOptions).setContent($("#modal-accessibility-content"));
    modalPhoto         = new jBox('Modal', modalOptions).setContent($("#modal-photo-content"));


    // ToDo on definitive close clear inputs (maybe ask)

    $("#modal-comment-btn-cancel").click(function () {

        modalComment.close();

    });

    $("#modal-comment-btn-next").click(function () {

        modalAccessibility.open();
        modalComment.close();

    });

    $("#modal-accessibility-btn-back").click(function () {

        modalAccessibility.close();
        modalComment.open();

    });

    $("#modal-accessibility-btn-next").click(function () {

        modalPhoto.open();
        modalAccessibility.close();

    });

    $("#modal-photo-btn-back").click(function () {

        modalPhoto.close();
        modalAccessibility.open();

    });

    $("#modal-photo-btn-next").click(function () {

        modalPhoto.close();
        insertDefibrillator();

    });

}

function renderMap() {

    map = L.map("map");
    map.setView(currLatLong, defaultZoom);

    // L.DomEvent.disableClickPropagation(L.DomUtil.get("btn-legend"));
    // L.DomEvent.disableScrollPropagation(L.DomUtil.get("btn-legend"));
    // L.DomEvent.disableClickPropagation(L.DomUtil.get("legend"));
    // L.DomEvent.disableScrollPropagation(L.DomUtil.get("legend"));

    positionMarker = L.marker(
        currLatLong,
        {icon: POSITION_MARKER_ICON, draggable: true}
    );

    positionMarker.on("dragend", function (e) {
        currLatLong = [
            e.target.getLatLng().lat,
            e.target.getLatLng().lng
        ];
        console.log(currLatLong);
    });

    osm = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution : "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
            errorTileUrl: "img/errorTile.png"
        }
    );

    bing = new L.tileLayer.bing(
        "AqSfYcbsnUwaN_5NvJfoNgNnsBfo1lYuRUKsiVdS5wQP3gMX6x8xuzrjZkWMcJQ1",
        {type: "AerialWithLabels"}
    );

    baseMaps = {
        "Open Street Map": osm,
        "Bing Aerial"    : bing
    };

    osm.addTo(map);
    positionMarker.addTo(map);

    controlLayers = L.control.layers(baseMaps, overlayMaps);
    controlLayers.addTo(map);

}

function adjustLegend() {

    // ToDo

}

function handleDb() { //ToDo handle connection errors

    localDb  = new PouchDB(LOCAL_DB_NAME);
    remoteDB = new PouchDB(REMOTE_DB_URL);

    retrieveDefibrillators();
}

function insertDefibrillator() {

    let timeStamp     = new Date().toISOString();
    let comment       = $("#modal-text-area").val();
    let accessibility = $("#modal-range").val();

    console.log(comment + ", " + accessibility);

    let defibrillator = {
        _id          : timeStamp,
        user         : uuid,
        location     : currLatLong,
        lang         : ln.language,
        timestamp    : timeStamp,
        accessibility: accessibility,
        comment      : comment,
        _attachments : {
            "image": {
                content_type: "image\/jpeg",
                data        : ""
            }
        }
    };

    // Insert the data in the local database
    localDb.put(defibrillator, function (err) {
        if (err) {
            showAlert("messages.localStorageError");

            // If an error occurs, insert the data in the remote database
            remoteDB.put(defibrillator, function (err) {
                if (err) {
                    showAlert("messages.generalError");
                    console.log(err);
                } else {
                    userDefibrillators.push(defibrillator);
                    displayNewDefibrillator(defibrillator);
                    showAlert("messages.contributionSuccess");
                }
            });
        } else {
            userDefibrillators.push(defibrillator);
            displayNewDefibrillator(defibrillator);

            if (networkState === Connection.NONE || navigator.onLine === false) {
                showAlert("messages.contributionSuccessNoInternet")
            } else {
                showAlert("messages.contributionSuccess")
            }

            // Replicate the data of the local database in the remote database
            localDb.replicate.to(remoteDB, {retry: true}).on("complete", function () {

                // Destroy the local database and create an empty new one
                localDb.destroy().then(function () {
                    localDb = new PouchDB(LOCAL_DB_NAME);
                });
            }).on("error", function (err) {
                console.log("Replication error: " + err);
            })
        }
    });
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

            remoteDB.get(id).then(function (doc) {
                return remoteDB.remove(doc);
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

function retrieveDefibrillators() {

    if (networkState === Connection.NONE || navigator.onLine === false) {
        showAlert("messages.noInternet");
    } else {
        remoteDB.allDocs({include_docs: true}, function (err, doc) {
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
            icon     : OTHER_DEFIBRILLATOR_ICON,
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

    controlLayers.addOverlay(userMarkersLayer,
        "<img src='../img/user-marker-icon.png' height='24' alt=''>  " + i18n.t("overlays.userMarkers")); // ToDo Fix
    controlLayers.addOverlay(otherMarkersLayer,
        "<img src='../img/marker-icon.png' height='24' alt=''>  " + i18n.t("overlays.otherMarkers"));

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
        icon     : USER_DEFIBRILLATOR_ICON,
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

function getUserPosition() {

    navigator.geolocation.getCurrentPosition(
        function (pos) {
            currLatLong = [
                pos.coords.latitude,
                pos.coords.longitude
            ];

            map.panTo(currLatLong);
            positionMarker.setLatLng(currLatLong);
            positionMarker.bindPopup(i18n.t("messages.positionMarkerPopup")).openPopup();
            clearInterval(locationWatcher);
        },
        function () {
            if (!isMobile) {
                positionMarker.bindPopup(i18n.t("messages.pcGPSError")).openPopup();
                clearInterval(locationWatcher);
            } else {
                if (countLocationPopup === 0) {
                    positionMarker.bindPopup(i18n.t("messages.mobileGPSError")).openPopup();
                    countLocationPopup++;
                }
            }
        },
        {timeout: 3000, enableHighAccuracy: true}
    );
}

function showAlert(msg) {

    navigator.notification.alert(
        i18n.t(msg),
        null,
        "Defibrillator Hunter",
        i18n.t("messages.ok")
    );
}





