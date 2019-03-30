"use strict";

// ToDo add "www" for Cordova
const positionMarkerIcon = L.icon({
    iconUrl    : "img/user-position-marker.png",
    iconSize   : [47, 71],
    iconAnchor : [23, 71],
    popupAnchor: [0, -72]
});

let positionMarker;

let map,
    controlLayers,
    baseMaps,
    overlayMaps = {};

let osm,
    bing;

let positionWatcherId         = undefined,
    isPositionWatcherAttached = false,
    positionWatcherOpts       = {
        enableHighAccuracy: true,
        timeout           : 3000,
        maximumAge        : 0
    };

let currLatLong  = [45.464161, 9.190336],
    currAccuracy = undefined,
    defaultZoom  = 10;


function initMap() {

    map = L.map("map");

    if (isApp)
        initAppMapUI();

    map.setView(currLatLong, defaultZoom);

    // Map events (see also lines 13810 and 14028 of leaflet.js)
    map.on("dragend", () => detachPositionWatcher());

    initLayers();
    attachPositionWatcher();
    initPositionMarker();
}


function initAppMapUI() {

    // Hide the default controls of leaflet
    $(".leaflet-control-container").hide();

    $("#map-control-hint").click(() => {

        console.log("Hint button");

    });

    $("#map-control-layers").click(() => {

        console.log("Layers button");

    });

    $("#map-control-gps").click(() => {

        console.log("GPS button");
        attachPositionWatcher();

    });

    $("#map-new-defibrillator").click(function () {

        // initDefibrillatorInsert();

        $("#map").hide();
        openInsert();

    });

}


// ToDo check connection
function initLayers() {

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
    // controlLayers = L.control.layers(baseMaps, overlayMaps).addTo(map);

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

    console.log("Position watcher detached");

}

function onPositionSuccess(pos) {

    currLatLong = [
        pos.coords.latitude,
        pos.coords.longitude
    ];

    currAccuracy = pos.coords.accuracy;

    console.log("Position found: " + currLatLong[0] + ", " + currLatLong[1] + " " + currAccuracy);

    let radius = currAccuracy / 2;

    map.setView(currLatLong, 17);

    positionMarker.setLatLng(currLatLong);

    // L.circle(currLatLong, radius).addTo(map);

}

function onPositionError(err) {
    console.log("Position error: " + err.message);
}


function initPositionMarker() {

    positionMarker = L.marker(
        currLatLong,
        {icon: positionMarkerIcon, draggable: true}
    );

    positionMarker.addTo(map);

    positionMarker.on("dragend", (e) => {

        currLatLong = [
            e.target.getLatLng().lat,
            e.target.getLatLng().lng
        ];

        currAccuracy = 0;

        console.log("Position marker dragged to: " + currLatLong);

        detachPositionWatcher();

    });

}