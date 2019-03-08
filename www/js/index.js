"use strict";

const LOCAL_DB_NAME = "dh_local_db";
const REMOTE_DB_URL = "http://localhost:5984/dh_points";

// ToDO change for cordova
const POSITION_MARKER_ICON = L.icon({
    iconUrl    : "img/position-marker-icon.png", // add "www" in front
    iconSize   : [54, 85],
    iconAnchor : [27, 97],
    popupAnchor: [0, -85]
});

// ToDO change for cordova
const USER_DEFIBRILLATOR_ICON = L.icon({
    iconUrl  : "img/user-marker-icon.png", // add "www" in front
    shadowUrl: "img/marker-shadow.png" // add "www" in front
});

// ToDO change for cordova
const OTHER_DEFIBRILLATOR_ICON = L.icon({
    iconUrl  : "img/marker-icon.png", // add "www" in front
    shadowUrl: "img/marker-shadow.png" // add "www" in front
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


// ToDO change for cordova
function onLoad() {
    // document.addEventListener("deviceready", initialize, false);
    initialize();
}

function initialize() {
    ln.init();
}

function onResize() {
    console.log("onResize() called");

    $map.height($(window).height());
}

// ToDO change for cordova
function init() {

    // isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    // isApp    = document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1;

    // Find the unique identifier of the user
    uuid = new Fingerprint().get().toString() + "-PC";
    // uuid = device.uuid;
    // if (uuid === null)
    //     uuid = new Fingerprint().get().toString() + "-PC";

    // networkState = navigator.connection.type;

    $mainPage.show();
    $("body").css("overflow-y", "hidden");

    initMenu();

    onResize();

    renderMap();

    // locationWatcher = setInterval(getUserPosition, 4000);

    handleDb();

    handleModals();

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

function renderMap() {

    map = L.map("map");
    map.setView(currLatLong, defaultZoom);

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

    // ToDo add connection check
    osm = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution : "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
            errorTileUrl: "img/errorTile.png"
        }
    );

    // ToDo add connection check
    bing = new L.tileLayer.bing(
        "AqSfYcbsnUwaN_5NvJfoNgNnsBfo1lYuRUKsiVdS5wQP3gMX6x8xuzrjZkWMcJQ1",
        {type: "AerialWithLabels"}
    );

    // ToDO i18n
    baseMaps = {
        "Open Street Map": osm,
        "Bing Aerial"    : bing
    };

    osm.addTo(map);
    positionMarker.addTo(map);

    controlLayers = L.control.layers(baseMaps, overlayMaps);
    controlLayers.addTo(map);

}

function handleDb() {

    //ToDo handle connection errors
    localDb  = new PouchDB(LOCAL_DB_NAME);
    remoteDB = new PouchDB(REMOTE_DB_URL);

    retrieveDefibrillators();
}

function handleModals() {

    let defibrillatorData = {};

    let $locationModal          = $("#location-modal"),
        $tempAccessibilityModal = $("#temp-accessibility-modal"),
        $spaAccessibilityModal  = $("#spa-accessibility-modal"),
        $otherInfoModal         = $("#other-info-modal");


    $otherInfoModal.modal("show");
    // initTemporalAccessibilityModal();
    // initSpacialAccessibilityModal();


    function initTemporalAccessibilityModal() {

        $("#check-monday").change(function () {
            $("#mon-from").prop("disabled", function (i, v) {
                return !v;
            });
            $("#mon-to").prop("disabled", function (i, v) {
                return !v;
            });
        });

        $("#check-tuesday").change(function () {
            $("#tue-from").prop("disabled", function (i, v) {
                return !v;
            });
            $("#tue-to").prop("disabled", function (i, v) {
                return !v;
            });
        });

        $("#check-wednesday").change(function () {
            $("#wed-from").prop("disabled", function (i, v) {
                return !v;
            });
            $("#wed-to").prop("disabled", function (i, v) {
                return !v;
            });
        });

        $("#check-thursday").change(function () {
            $("#thu-from").prop("disabled", function (i, v) {
                return !v;
            });
            $("#thu-to").prop("disabled", function (i, v) {
                return !v;
            });
        });

        $("#check-friday").change(function () {
            $("#fri-from").prop("disabled", function (i, v) {
                return !v;
            });
            $("#fri-to").prop("disabled", function (i, v) {
                return !v;
            });
        });

        $("#check-saturday").change(function () {
            $("#sat-from").prop("disabled", function (i, v) {
                return !v;
            });
            $("#sat-to").prop("disabled", function (i, v) {
                return !v;
            });
        });

        $("#check-sunday").change(function () {
            $("#sun-from").prop("disabled", function (i, v) {
                return !v;
            });
            $("#sun-to").prop("disabled", function (i, v) {
                return !v;
            });
        });

    }

    function initSpacialAccessibilityModal() {

        $("#spa-accessibility-range").slider({
            ticks            : [10, 20, 30, 40, 50, 60, 70, 80, 90],
            ticks_labels     : ["10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%"],
            ticks_snap_bounds: 50,
            value            : 50
        });

    }


    // Close first modal
    $("#location-modal-close").click(() => $locationModal.removeClass("d-block"));

    // First -> Second
    $("#location-modal-next").click(() => {

        switchModals($locationModal, $tempAccessibilityModal);

        defibrillatorData.location = {
            type   : LOCATION_TYPE[$("input[name='locationTypeOptions']:checked").val()],
            subType: LOCATION_SUBTYPE[$("input[name='locationSubtypeOptions']:checked").val()],
            floor  : $("#location-floor").val(),
            notes  : $("#location-notes").val() // ToDo parse
        };

    });

    // Second -> First
    $("#temp-accessibility-modal-back").click(() => switchModals($tempAccessibilityModal, $locationModal));

    // Second -> Third
    $("#temp-accessibility-modal-next").click(() => {

        switchModals($tempAccessibilityModal, $spaAccessibilityModal);

        let temporalAccessibility = {
            dayType: DAY_TYPE[$("input[name='accessibilityDayType']:checked").val()],
            dayTime: DAY_TIME[$("input[name='accessibilityTime']:checked").val()]
        };

        let details = {};

        $("#specific-days :checkbox").each(function () {
            if (this.checked) {

                let day    = $(this).val();
                let fromId = "#" + day.substring(0, 3) + "-from";
                let toId   = "#" + day.substring(0, 3) + "-to";

                details[day] = {
                    from: $(fromId).val(),
                    to  : $(toId).val()
                };
            }
        });

        temporalAccessibility.details = details;

        defibrillatorData.temporalAccessibility = temporalAccessibility;
    });

    // Third -> Second
    $("#spa-accessibility-modal-back").click(() => switchModals($spaAccessibilityModal, $tempAccessibilityModal));

    // Third -> Fourth
    $("#spa-accessibility-modal-next").click(() => {

        switchModals($spaAccessibilityModal, $otherInfoModal);

        defibrillatorData.spacialAccessibility = {
            score  : $("#spa-accessibility-range").val(),
            details: $("#spa-accessibility-details").val()
        };
    });

    // Fourth -> Third
    $("#other-info-modal-back").click(() => switchModals($tempAccessibilityModal, $otherInfoModal));

    // Fourth -> Fifth
    $("#other-info-modal-next").click(() => {

        defibrillatorData.ownership = "??"; // ToDo ask for ownership

        defibrillatorData.contactPerson = $("input[name='contactPerson']:checked").val() === "yes";

        console.log(defibrillatorData);

    });


    function switchModals(toHide, toShow) {
        toHide.removeClass("fade").modal("hide");
        toShow.modal("show").addClass("fade");
    }
}

function insertDefibrillator() {

    let timeStamp     = new Date().toISOString();
    let comment       = $("#modal-text-area").val();
    let accessibility = $("#modal-range").val();

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

// ToDO change for cordova
function retrieveDefibrillators() {

    // if (networkState === Connection.NONE || navigator.onLine === false) {
    if (false) {
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





