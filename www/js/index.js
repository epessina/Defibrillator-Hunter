"use strict";

const LOCAL_DB_NAME = "dh_local_db";
const REMOTE_DB_URL = "http://localhost:5984/dh_points";

const MARKER_ICON = L.icon({
    iconUrl    : "www/img/markerBlue.png",
    iconSize   : [54, 85],
    iconAnchor : [27, 97],
    popupAnchor: [0, -85]
});

let isMobile;

let $mainPage = $("#main-page");

let $map = $("#map"),
    map;

let $btnInsert = $("#btn-insert");

let currLatLong = [0, 0], //ToDO change
    defaultZoom = 3;

let positionMarker;

let locationWatcher,
    countLocationPopup = 0;

let uuid;

let defibrillators = [];

// Db related
let localDb,
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
    document.addEventListener("deviceready", init, false); // ToDo initialize()
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
    // adjustLegend();
    // adjustGuidelinesList();
}

function init() {

    isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    // Find the unique identifier of the user
    uuid = device.uuid;
    if (uuid === null)
        uuid = new Fingerprint().get().toString() + "-PC";

    $mainPage.show();
    $("body").css("overflow-y", "hidden");

    onResize();

    map = L.map("map");
    map.setView(currLatLong, defaultZoom);

    positionMarker = L.marker(
        currLatLong,
        {icon: MARKER_ICON, draggable: true}
    );

    positionMarker.on("dragend", function (e) {
        currLatLong = [
            e.target.getLatLng().lat,
            e.target.getLatLng().lng
        ];

        console.log(currLatLong);
    });

    let osm = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution : "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
            errorTileUrl: "img/errorTile.png"
        }
    );

    osm.addTo(map);
    positionMarker.addTo(map);

    locationWatcher = setInterval(getUserPosition, 4000);

    handleDb();

    $btnInsert.click(function () {
        insertDefibrillator("A test comment", "the image");
    });

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
        lang        : "en", //ToDO use ln.language
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
    // ToDo use i18n for messages
    localDb.put(defibrillator, function (err) {
        if (err) {
            console.log("Error inserting data in local db: " + err);

            // If an error occurs, insert the data in the remote database
            remoteDB.put(defibrillator, function (err) {
                if (err) {
                    console.log("Error inserting data in remote db: " + err);
                } else {
                    console.log("Data inserted in remote db!");
                }
            });

        } else {
            // Replicate the data of the local database in the remote database
            localDb.replicate.to(remoteDB, {retry: true}).on("complete", function () {
                console.log("Data replicated in remote db!");

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

function retrieveDefibrillators() {

    remoteDB.allDocs({include_docs: true}, function (err, doc) { // ToDo use i18n for messages
        if (err) {
            console.log("Error retrieving docs " + err);
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

            displayDefibrillators();
        }
    })
}

function displayDefibrillators() {

    let markers = L.markerClusterGroup();

    for (let i = 0; i < defibrillators.length; i++) {

        let def    = defibrillators[i];
        let marker = L.marker(def.location);

        let popup =
                "<p><b>id: </b>" + def.id + "</p>" +
                "<p><b>Location: </b>" + def.location + "</p>" +
                "<p><b>Comment: </b>" + def.comment + "</p>";
        marker.bindPopup(popup);

        markers.addLayer(marker);
    }

    map.addLayer(markers);
}

function getUserPosition() {

    navigator.geolocation.getCurrentPosition(
        function (pos) {
            console.log(pos);

            currLatLong = [
                pos.coords.latitude,
                pos.coords.longitude
            ];

            map.panTo(currLatLong);
            positionMarker.setLatLng(currLatLong);

            clearInterval(locationWatcher);
        },
        function () {
            if (!isMobile) {
                console.log("GPS error");
                clearInterval(locationWatcher);
            } else {
                if (countLocationPopup === 0) {
                    console.log("Mobile GPS error");
                    countLocationPopup++;
                }
            }
        },
        {timeout: 3000, enableHighAccuracy: true}
    );

}





