"use strict";


const defibrillatorIcon = L.icon({
    iconUrl        : "img/ls-marker.png",
    iconRetinaUrl  : "img/ls-marker-2x.png",
    shadowUrl      : "img/ls-marker-shadow.png",
    shadowRetinaUrl: "img/ls-marker-shadow-2x.png",
    iconSize       : [31, 37],
    shadowSize     : [31, 19],
    iconAnchor     : [31, 37],
    shadowAnchor   : [18, 18]
});

const positionWatcherOpts = {
    enableHighAccuracy: true,
    timeout           : 3000,
    maximumAge        : 0
};

const defaultLatLong = [45.464161, 9.190336],
      defaultZoom    = 11,
      watcherZoom    = 17,
      zoomLimit      = 15;

let
    accuracyCircle            = undefined,
    positionWatcherId         = undefined,
    isPositionWatcherAttached = false,
    currLatLong               = defaultLatLong,
    currLatLongAccuracy       = 0,
    isFirstPositionFound      = true,
    centerMap                 = true,
    autoZoom                  = true,
    clusterClick              = false;

let $gps                = $("#map-control-gps"),
    $findingPositionMsg = $("#finding-position-msg");




/**
 * Attach a position watcher.
 */
function attachPositionWatcher() {

    $gps.addClass("gps-on");

    if (isPositionWatcherAttached)
        return;

    $findingPositionMsg.show();

    positionWatcherId = navigator.geolocation.watchPosition(
        onPositionSuccess,
        err => console.error("Error finding the position", err),
        positionWatcherOpts
    );

    isPositionWatcherAttached = true;

    console.log("Position watcher attached");

}

/**
 * Detach a position watcher.
 */
function detachPositionWatcher() {

    if (!isPositionWatcherAttached)
        return;

    $gps.removeClass("gps-on");

    navigator.geolocation.clearWatch(positionWatcherId);

    isPositionWatcherAttached = false;

    console.log("Position watcher detached");

}




/**
 * Callback to be fired when a new position is found.
 *
 * @param pos: the position found.
 */
function onPositionSuccess(pos) {

    currLatLong         = [pos.coords.latitude, pos.coords.longitude];
    currLatLongAccuracy = pos.coords.accuracy;

    console.log("Position found");

    $findingPositionMsg.hide();

    if (isFirstPositionFound) {

        map.setView(currLatLong, watcherZoom);
        isFirstPositionFound = false;
        autoZoom             = false;

    } else if (centerMap)
        map.panTo(currLatLong);

    positionMarker.setLatLng(currLatLong);

    if (accuracyCircle !== undefined)
        map.removeLayer(accuracyCircle);

    accuracyCircle = L.circle(currLatLong, {
        radius : currLatLongAccuracy / 2,
        color  : "green",
        opacity: .5
    }).addTo(map);

}