"use strict";


const positionMarkerIcon = L.icon({
    iconUrl    : "img/user-position-marker.png",
    iconSize   : [47, 71],
    iconAnchor : [23, 71],
    popupAnchor: [0, -72]
});

const defibrillatorIcon = L.icon({
    iconUrl    : "img/def-icon.png",
    iconSize   : [31, 42],
    iconAnchor : [16, 42],
    popupAnchor: [0, -43]
});

let map;

let positionMarker,
    accuracyCircle = undefined;

let positionWatcherId         = undefined,
    isPositionWatcherAttached = false,
    positionWatcherOpts       = {
        enableHighAccuracy: true,
        timeout           : 3000,
        maximumAge        : 0
    };

const defaultLatLong = [45.464161, 9.190336],
      defaultZoom    = 10;

let currLatLong  = undefined,
    currAccuracy = undefined;


function initMap() {

    map = L.map("map", { zoomSnap: 0 });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution : "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
        errorTileUrl: "img/errorTile.png"
    }).addTo(map);

    map.setView(defaultLatLong, defaultZoom);

    initAppMapUI();

    map.on("dragend", () => detachPositionWatcher());


    // cordova.plugins.diagnostic.isLocationEnabled(
    //     gps => {
    //
    //         if (gps)
    //             logOrToast("GPS enable");
    //         else {
    //             logOrToast("GPS disabled");
    //         }
    //
    //     },
    //     () => logOrToast("Error checking the GPS")
    // );


    // attachPositionWatcher();
    initPositionMarker();

}


function initAppMapUI() {

    // Hide the default controls of leaflet
    $(".leaflet-control-container").hide();

    $("#map-control-hint").click(() => console.log("Hint button"));

    $("#map-control-gps").click(() => attachPositionWatcher());

    $("#map-new-defibrillator").click(e => {
        openInsert();
        e.stopPropagation();
    });

}


function attachPositionWatcher() {

    if (isPositionWatcherAttached)
        return;

    $("#map-control-gps").addClass("gps-on");

    positionWatcherId = navigator.geolocation.watchPosition(
        onPositionSuccess,
        onPositionError,
        positionWatcherOpts
    );

    isPositionWatcherAttached = true;

    console.log("Position watcher attached");

}

function detachPositionWatcher() {

    if (!isPositionWatcherAttached)
        return;

    $("#map-control-gps").removeClass("gps-on");

    navigator.geolocation.clearWatch(positionWatcherId);

    isPositionWatcherAttached = false;

}

function onPositionSuccess(pos) {

    currLatLong  = [pos.coords.latitude, pos.coords.longitude];
    currAccuracy = pos.coords.accuracy;

    console.log("Position found: " + currLatLong[0] + ", " + currLatLong[1] + " " + currAccuracy);

    map.setView(currLatLong, 17);

    positionMarker.setLatLng(currLatLong);

    if (accuracyCircle !== undefined)
        map.removeLayer(accuracyCircle);

    accuracyCircle = L.circle(currLatLong, {
        radius : currAccuracy / 2,
        color  : "green",
        opacity: .5
    }).addTo(map);

}

function onPositionError(err) {
    console.log("Position error: " + err.message);
}


function initPositionMarker() {

    positionMarker = L.marker(
        defaultLatLong,
        { icon: positionMarkerIcon, draggable: true }
    );

    positionMarker.addTo(map);

    positionMarker.on("dragstart", () => {

        detachPositionWatcher();

        if (accuracyCircle !== undefined) {
            map.removeLayer(accuracyCircle);
            accuracyCircle = undefined;
        }
    });

    positionMarker.on("dragend", (e) => {

        currLatLong = [
            e.target.getLatLng().lat,
            e.target.getLatLng().lng
        ];

        currAccuracy = 0;

        console.log("Position marker dragged to: " + currLatLong);

    });

}