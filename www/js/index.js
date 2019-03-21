"use strict";

const LOCAL_DB         = "dh_local_db";
const REMOTE_USERS_DB  = "http://localhost:5984/dh_users";
const REMOTE_POINTS_DB = "http://localhost:5984/dh_points";

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


let $mainPage = $("#main-page");

let $menuButton  = $("#nav-button"),
    $menuWrapper = $("#nav-wrapper"),
    $menuOverlay = $("#nav-overlay"),
    isMenuOpen   = false,
    $btnInsert   = $("#btn-insert");

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
    usersDB,
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

    uuid = new Fingerprint().get().toString() + "-PC";
    // uuid = device.uuid;
    // if (uuid === null)
    //     uuid = new Fingerprint().get().toString() + "-PC";

    // networkState = navigator.connection.type;

    $("body").css("overflow-y", "hidden");
    onResize();

    // handleUserModal();

    // initMenu();


    initMap();

    // locationWatcher = setInterval(getUserPosition, 4000);

    handleDb();

    initDefibrillatorInsert();

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

    document.addEventListener("click", closeMenu);

    $btnInsert.click(function () {

        closeMenu();
        handleModals();
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


function handleDb() {

    //ToDo handle connection errors
    localDb  = new PouchDB(LOCAL_DB);
    usersDB  = new PouchDB(REMOTE_USERS_DB);
    pointsDB = new PouchDB(REMOTE_POINTS_DB);


    retrieveDefibrillators();
}


function handleModals() {

    let defibrillatorData = {};

    let $locationModal          = $("#location-modal"),
        $tempAccessibilityModal = $("#temp-accessibility-modal"),
        $spaAccessibilityModal  = $("#spa-accessibility-modal"),
        $otherInfoModal         = $("#other-info-modal"),
        $photoModal             = $("#photo-modal");

    let photo;


    $locationModal.modal("show");
    initTemporalAccessibilityModal();
    initSpacialAccessibilityModal();
    initPhotoModal();


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

    function initPhotoModal() {

        $("#photo-input").change(() => {

            let file   = $("#photo-input")[0].files[0];
            let reader = new FileReader();

            if (file)
                reader.readAsDataURL(file); // Calls onload

            reader.onload = function (event) {

                let type    = file.type;
                let dataURL = event.target.result;

                $(".photo-upload-preview").attr("src", dataURL);
                $(".photo-upload-content").show();

                photo = {
                    content_type: type,
                    data        : dataURL.substr(dataURL.indexOf(",") + 1)
                };

                $("#photo-modal-done").prop("disabled", false);
            }
        });
    }

    // Close location modal
    $("#location-modal-close").click(() => $locationModal.removeClass("d-block"));

    // Location -> Temporal Accessibility
    $("#location-modal-next").click(() => {

        switchModals($locationModal, $tempAccessibilityModal);

        defibrillatorData.location = {
            type   : LOCATION_TYPE[$("input[name='locationTypeOptions']:checked").val()],
            subType: LOCATION_SUBTYPE[$("input[name='locationSubtypeOptions']:checked").val()],
            floor  : $("#location-floor").val(),
            notes  : $("#location-notes").val() // ToDo parse
        };

    });

    // Temporal Accessibility -> Location
    $("#temp-accessibility-modal-back").click(() => switchModals($tempAccessibilityModal, $locationModal));

    // Temporal Accessibility -> Spacial Accessibility
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

    // Spacial Accessibility -> Temporal Accessibility
    $("#spa-accessibility-modal-back").click(() => switchModals($spaAccessibilityModal, $tempAccessibilityModal));

    // Spacial Accessibility -> Other Info
    $("#spa-accessibility-modal-next").click(() => {

        switchModals($spaAccessibilityModal, $otherInfoModal);

        defibrillatorData.spacialAccessibility = {
            score  : $("#spa-accessibility-range").val(),
            details: $("#spa-accessibility-details").val()
        };
    });

    // Other Info -> Spacial Accessibility
    $("#other-info-modal-back").click(() => switchModals($otherInfoModal, $spaAccessibilityModal));

    // Other Info -> Photo
    $("#other-info-modal-next").click(() => {

        switchModals($otherInfoModal, $photoModal);

        defibrillatorData.ownership     = "??"; // ToDo ask for ownership
        defibrillatorData.contactPerson = $("input[name='contactPerson']:checked").val() === "yes";
        defibrillatorData.otherNotes    = $("#other-notes").val();
    });

    // Photo -> Other Info
    $("#photo-modal-back").click(() => switchModals($photoModal, $otherInfoModal));

    // Photo -> Done
    $("#photo-modal-done").click(() => {

        defibrillatorData._attachments = {
            "photo": photo
        };

        $photoModal.removeClass("fade").modal("hide");

        console.log(defibrillatorData);
    });


    function switchModals(toHide, toShow) {
        toHide.removeClass("fade").modal("hide");
        toShow.modal("show").addClass("fade");
    }
}


function initDefibrillatorInsert() {

    let $mainPage                    = $("#insert-defibrillator-main"),
        $dialogLocation              = $("#dialog-location"),
        $dialogFloor                 = $("#dialog-floor"),
        $dialogTemporalAccessibility = $("#dialog-temporal-accessibility"),
        $dialogRecovery              = $("#dialog-recovery"),
        $dialogSignage               = $("#dialog-signage"),
        $dialogNotes                 = $("#dialog-notes"),
        $dialogPresence              = $("#dialog-presence"),
        $dialogPhoto                 = $("#dialog-photo");

    // Global values
    let locationCategory      = "none",
        visualReference       = "",
        floor                 = 0,
        temporalAccessibility = "h24",
        recovery              = "Immediate",
        signage               = "Great",
        brand                 = "",
        notes                 = "",
        presence              = "Yes",
        photo                 = "";


    // Main page

    $("#new-defibrillator-close").click(() => console.log("Close new defibrillator"));

    $("#new-defibrillator-done").click(() => {

        let defibrillator = {
            locationCategory     : locationCategory,
            visualReference      : visualReference,
            floor                : floor,
            temporalAccessibility: temporalAccessibility,
            recovery             : recovery,
            signage              : signage,
            brand                : brand,
            notes                : notes,
            presence             : presence,
            photo                : photo
        };

        console.log(defibrillator)
    });


    // Location category

    let $locationSelect = $("#location-select");

    $("#location-category-request").click(() => {

        switchFullscreenDialogs($mainPage, $dialogLocation);

        // When the dialog open the values of the fields must be set to the selected once, to avoid having different
        // values if the user closes the dialog having made some changes

        $locationSelect.get(0).selectedIndex = $locationSelect.find("option[value=" + locationCategory + "]").index();
        changeLocationSelectLabel();

        $("#location-reference").val(visualReference);

    });

    $locationSelect.change(() => changeLocationSelectLabel());

    $("#location-close").click(() => switchFullscreenDialogs($dialogLocation, $mainPage));

    $("#location-done").click(() => {

        locationCategory = $("#location-select").val();

        if (locationCategory === "none") {
            console.log("Category none"); // ToDo handle error
            return;
        }

        visualReference = $("#location-reference").val();
        $("#location-text").html(locationCategory);

        switchFullscreenDialogs($dialogLocation, $mainPage);

    });


    // Floor

    let $floorCounterValue = $("#floor-counter-value");
    let newFloor           = floor;

    $("#floor-request").click(() => {

        $floorCounterValue.html(floor.toString());
        newFloor = floor;

        openDialog($dialogFloor);

    });

    $("#floor-counter-add").click(() => {

        if (newFloor === 10)
            return;

        newFloor++;
        $floorCounterValue.html(newFloor.toString());

    });

    $("#floor-counter-sub").click(() => {

        if (newFloor === -4)
            return;

        newFloor--;
        $floorCounterValue.html(newFloor.toString());

    });

    $("#floor-cancel").click(() => closeDialog($dialogFloor));

    $("#floor-ok").click(() => {

        floor = newFloor;
        $("#floor-text").html(floor.toString());

        closeDialog($dialogFloor);

    });


    // Temporal accessibility

    $("#temporal-accessibility-request").click(() => {

        $("input[name='temporalAccessibility'][value='" + temporalAccessibility + "']")
            .prop("checked", "true");

        openDialog($dialogTemporalAccessibility);

    });

    $("#temporal-cancel").click(() => closeDialog($dialogTemporalAccessibility));

    $("#temporal-ok").click(() => {

        temporalAccessibility = $("input[name='temporalAccessibility']:checked").val();
        $("#temporal-text").html(temporalAccessibility);

        closeDialog($dialogTemporalAccessibility);

    });


    // Recovery

    $("#recovery-request").click(() => {

        $("input[name='recovery'][value='" + recovery + "']")
            .prop("checked", "true");

        openDialog($dialogRecovery);

    });

    $("#recovery-cancel").click(() => closeDialog($dialogRecovery));

    $("#recovery-ok").click(() => {

        recovery = $("input[name='recovery']:checked").val();
        $("#recovery-text").html(recovery);

        closeDialog($dialogRecovery);

    });


    // Signage

    $("#signage-request").click(() => {

        $("input[name='signage'][value='" + signage + "']")
            .prop("checked", "true");

        openDialog($dialogSignage);

    });

    $("#signage-cancel").click(() => closeDialog($dialogSignage));

    $("#signage-ok").click(() => {

        signage = $("input[name='signage']:checked").val();
        $("#signage-text").html(signage);

        closeDialog($dialogSignage);

    });


    // Notes

    $("#notes-request").click(() => {

        switchFullscreenDialogs($mainPage, $dialogNotes);

        $("#brand").val(brand);
        $("#notes").val(notes);

    });

    $("#notes-close").click(() => switchFullscreenDialogs($dialogNotes, $mainPage));

    $("#notes-done").click(() => {

        brand = $("#brand").val();
        notes = $("#notes").val();

        $("#notes-text").html("Edit your additional notes");

        switchFullscreenDialogs($dialogNotes, $mainPage);

    });


    // Presence

    $("#presence-request").click(() => {

        $("input[name='presence'][value='" + presence + "']")
            .prop("checked", "true");

        openDialog($dialogPresence);

    });

    $("#presence-cancel").click(() => closeDialog($dialogPresence));

    $("#presence-ok").click(() => {

        presence = $("input[name='presence']:checked").val();
        $("#presence-text").html(presence);

        closeDialog($dialogPresence);

    });


    // Photo

    let $btnCancelPhoto = $("#photo-cancel-btn");

    let newPhoto      = "";
    let btnCancelTop  = 0,
        btnCancelLeft = 0;

    $("#photo-request").click(() => {

        newPhoto = "";
        previewPhoto(photo);

        if (photo !== "")
            $btnCancelPhoto.css("left", btnCancelLeft).css("top", btnCancelTop).show();

        switchFullscreenDialogs($mainPage, $dialogPhoto);

    });

    // ToDO delete
    $("#tmp-photo-input").change(() => {

        let file   = $("#tmp-photo-input")[0].files[0];
        let reader = new FileReader();

        if (file)
            reader.readAsDataURL(file);

        reader.onload = function (event) {

            let type    = file.type;
            let dataURL = event.target.result;

            getPictureSuccess(dataURL.substr(dataURL.indexOf(",") + 1));
        }
    });

    $("#btn-camera").click(() => {
        getPicture(Camera.PictureSourceType.CAMERA);
    });

    $("#btn-gallery").click(() => {
        getPicture(Camera.PictureSourceType.SAVEDPHOTOALBUM);
    });

    function getPicture(srcType) {

        let options = {
            quality           : 50,
            destinationType   : Camera.DestinationType.DATA_URL,
            sourceType        : srcType,
            encodingType      : Camera.EncodingType.JPEG,
            mediaType         : Camera.MediaType.PICTURE,
            allowEdit         : false,
            correctOrientation: true
        };

        navigator.camera.getPicture(getPictureSuccess, getPictureFail, options);
    }

    function getPictureSuccess(data) {

        console.log("Picture success");

        newPhoto = data;

        let img    = new Image();
        img.src    = "data:image/jpeg;base64," + data;
        img.onload = () => {

            let imgWidth  = img.width,
                imgHeight = img.height,
                ratio     = imgWidth / imgHeight;

            if (ratio >= 1) {
                if (imgWidth > 200) {
                    imgWidth  = 200;
                    imgHeight = imgWidth / ratio;
                }
            } else {
                if (imgHeight > 200) {
                    imgHeight = 200;
                    imgWidth  = imgHeight * ratio;
                }
            }

            let $photoPreviewWrapper = $("#photo-preview-wrapper");

            previewPhoto(data);

            let top = parseInt($(".top-bar").first().css("height")) +
                parseInt($photoPreviewWrapper.css("margin-top")) +
                parseInt($photoPreviewWrapper.css("height")) / 2 -
                imgHeight / 2 -
                parseInt($btnCancelPhoto.css("height")) / 2;


            let left = $(document).width() / 2 +
                imgWidth / 2 -
                parseInt($btnCancelPhoto.css("height")) / 2;

            $btnCancelPhoto.css("left", left).css("top", top).show();
        };

    }

    function getPictureFail(error) {
        console.log("Picture error: " + error)
    }

    $btnCancelPhoto.click(() => {

        newPhoto = "";

        $("#photo-cancel-btn").hide();
        previewPhoto(newPhoto);

    });

    $("#photo-close").click(() => {

        newPhoto = "";
        switchFullscreenDialogs($dialogPhoto, $mainPage)

    });

    $("#photo-done").click(() => {

        photo         = newPhoto;
        newPhoto      = "";
        btnCancelTop  = parseInt($btnCancelPhoto.css("top"));
        btnCancelLeft = parseInt($btnCancelPhoto.css("left"));

        if (photo === "")
            $("#photo-text").html("Add a photo");
        else
            $("#photo-text").html("Edit your photo");

        switchFullscreenDialogs($dialogPhoto, $mainPage);

    });


    // Utility functions

    function switchFullscreenDialogs(toHide, toShow) {
        toShow.show();
        toHide.hide();
    }

    function openDialog(toOpen) {
        $("#opaque-overlay").show();
        $("#insert-defibrillator").css("overflow-y", "hidden");
        toOpen.show();
    }

    function closeDialog(toClose) {
        toClose.hide();
        $("#opaque-overlay").hide();
        $("#insert-defibrillator").css("overflow-y", "scroll");
    }

    function changeLocationSelectLabel() {
        let label = $("[for='location-select']").find(".label-description");

        if ($locationSelect.val() === "none")
            label.html("Select a category");
        else
            label.html($locationSelect.find("option:selected").text());
    }

    function previewPhoto(photo) {

        if (photo === "")
            $("#def-photo-preview").attr("src", "img/img-placeholder-200.png");

        else
            $("#def-photo-preview").attr("src", "data:image/jpeg;base64," + photo);
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
            pointsDB.put(defibrillator, function (err) {
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
            localDb.replicate.to(pointsDB, {retry: true}).on("complete", function () {

                // Destroy the local database and create an empty new one
                localDb.destroy().then(function () {
                    localDb = new PouchDB(LOCAL_DB);
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





