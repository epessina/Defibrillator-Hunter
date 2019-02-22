"use strict";

const LOCAL_DB_NAME = "dh_local_db";
const REMOTE_DB_URL = "http://localhost:5984/dh_points";

const POSITION_MARKER_ICON = L.icon({
    iconUrl    : "www/img/markerBlue.png",
    iconSize   : [54, 85],
    iconAnchor : [27, 97],
    popupAnchor: [0, -85]
});

let isMobile,
    isApp;

let $mainPage = $("#main-page");

let $map = $("#map"),
    map;

let $btnLegend = $("#btn-legend"),
    $legend    = $("#legend"),
    $osm       = $("#osm"),
    $bing      = $("#bing"),
    legendWidth,
    legendHeight;

let osm,
    bing;

let $btnInsert = $("#btn-insert");

let currLatLong = [0, 0], //ToDO change
    defaultZoom = 3;

let positionMarker;

let locationWatcher,
    countLocationPopup = 0;

let uuid;

let defibrillators = [],
    defMarkersAll;

let networkState,
    localDb,
    remoteDB;


// Callback function
// $(function () {
//     init();
// });

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

    onResize();

    renderMap();

    locationWatcher = setInterval(getUserPosition, 4000);

    handleDb();

    $btnInsert.click(function () {
        insertDefibrillator("A test comment", "the image");
    });

}

function renderMap() {

    map = L.map("map");
    map.setView(currLatLong, defaultZoom);

    L.DomEvent.disableClickPropagation(L.DomUtil.get("btn-legend"));
    L.DomEvent.disableScrollPropagation(L.DomUtil.get("btn-legend"));
    L.DomEvent.disableClickPropagation(L.DomUtil.get("legend"));
    L.DomEvent.disableScrollPropagation(L.DomUtil.get("legend"));

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

    osm.addTo(map);
    positionMarker.addTo(map);

    $btnLegend.on("vclick", function () {
        $legend.toggle();

        legendWidth  = $legend.width();
        legendHeight = $legend.height();

        adjustLegend();
    });

    $osm.click(function () {
        if (networkState === Connection.NONE || navigator.onLine === false) {
            showAlert("messages.osmNoInternet");
        } else {
            switchMapLayers(bing, osm)
        }
    });

    $bing.click(function () {
        if (networkState === Connection.NONE || navigator.onLine === false) {
            showAlert("messages.bingNoInternet");
        } else {
            switchMapLayers(osm, bing)
        }
    });
}

function switchMapLayers(toRemove, toAdd) {

    if (map.hasLayer(toRemove))
        map.removeLayer(toRemove);

    if (!map.hasLayer(toAdd))
        map.addLayer(toAdd);
}

function adjustLegend() {

    if (legendHeight + 108 > $map.height()) {
        $legend.css("height", ($map.height - 108) + "px");
        $legend.css("width", (legendWidth + 10) + "px");
    } else {
        $legend.css("height", "auto");
        $legend.css("width", "auto");
    }
}

function handleDb() { //ToDo handle connection errors

    localDb  = new PouchDB(LOCAL_DB_NAME);
    remoteDB = new PouchDB(REMOTE_DB_URL);

    retrieveDefibrillators();
}

function insertDefibrillator(comment, img) {

    let timeStamp     = new Date().toISOString();
    let defibrillator = {
        _id         : timeStamp,
        user        : uuid,
        location    : currLatLong,
        lang        : ln.language,
        timestamp   : timeStamp,
        comment     : comment,
        _attachments: {
            "image": {
                content_type: "image\/jpeg",
                data        : img
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
                    showAlert("messages.contributionSuccess");
                }
            });
        } else {
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

    // ToDO show new marker
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
                defibrillators = [];

                doc.rows.forEach(function (row) {
                    if (row.doc.location != null) {
                        let defibrillator = {
                            id      : row.doc._id,
                            location: row.doc.location,
                            comment : row.doc.comment
                        };
                        defibrillators.push(defibrillator);
                    }
                });

                defMarkersAll = displayDefibrillators();
            }
        })
    }
}

function displayDefibrillators() {

    let markers = L.markerClusterGroup();

    for (let i = 0; i < defibrillators.length; i++) {

        let def    = defibrillators[i];
        let marker = L.marker(def.location);

        let popup =
                "<p><b>" + i18n.t("popup.id") + "</b>" + def.id + "</p>" +
                "<p><b>" + i18n.t("popup.location") + "</b>" + def.location + "</p>" +
                "<p><b>" + i18n.t("popup.comment") + "</b>" + def.comment + "</p>";
        marker.bindPopup(popup);

        markers.addLayer(marker);
    }

    map.addLayer(markers);
    return markers;
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





