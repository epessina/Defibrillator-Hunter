"use strict";

let defibrillator = null;

let locationCategory      = "",
    transportType         = "",
    visualReference       = "",
    floor                 = "",
    newFloor              = "",
    temporalAccessibility = "",
    recovery              = "",
    signage               = "",
    brand                 = "",
    notes                 = "",
    presence              = "",
    photo                 = "",
    photoCoordinates      = "";

let $locationSelect      = $("#location-select"),
    $transportTypeSelect = $("#transport-type-select");

let $photoThm = $("#photo-thm");


function initInsert() {

    initMainPage();

    initLocationCategoryDialog();
    initFloorDialog();
    initTemporalAccessibilityDialog();
    initRecoveryDialog();
    initSignageDialog();
    initNotesDialog();
    initPresenceDialog();

}

function openInsert(data = null) {

    if (data) {

        defibrillator         = data;
        presence              = defibrillator.presence;
        locationCategory      = defibrillator.locationCategory;
        transportType         = defibrillator.transportType;
        visualReference       = defibrillator.visualReference;
        floor                 = defibrillator.floor;
        temporalAccessibility = defibrillator.temporalAccessibility;
        recovery              = defibrillator.recovery;
        signage               = defibrillator.signage;
        brand                 = defibrillator.brand;
        notes                 = defibrillator.notes;
        photo                 = serverUrl + defibrillator.imageUrl;

        $("#presence-text").html(i18n.t("insert.presence.enum." + presence));
        $("#location-text").html(i18n.t("insert.locationCategory.enum." + locationCategory));
        $("#floor-text").html(floor);
        $("#temporal-text").html(i18n.t("insert.temporalAccessibility.enum." + temporalAccessibility));

        if (recovery !== "") $("#recovery-text").html(i18n.t("insert.recovery.enum." + recovery));
        if (signage !== "") $("#signage-text").html(i18n.t("insert.signage.enum." + signage));
        if (notes !== "") $("#notes-text").html(i18n.t("insert.notes.editText"));

        $photoThm
            .find("img")
            .attr("src", photo)
            .show();

        $photoThm
            .find("i")
            .hide();

        closeInfo();

    }

    $("#insert-defibrillator").show();

}

function closeInsert() {
    $("#insert-defibrillator").scrollTop(0).hide();
    resetFields();
}


// Main page
function initMainPage() {

    $("#new-defibrillator-close").click(() => {

        createAlertDialog(
            "",
            i18n.t("dialogs.insert.confirmClose"),
            i18n.t("dialogs.insert.btnKeepEditing"),
            null,
            i18n.t("dialogs.insert.btnDiscard"),
            () => {
                if (defibrillator)
                    openInfo(defibrillator._id);
                closeInsert();
            }
        );

    });

    $("#new-defibrillator-done").click(() => {

        if (presence === "") {
            logOrToast(i18n.t("messages.mandatoryPresence"), "long");
            return;
        }

        if (locationCategory === "") {
            logOrToast(i18n.t("messages.mandatoryLocationCategory"), "long");
            return;
        }

        if (floor === "") {
            logOrToast(i18n.t("messages.mandatoryFloor"), "long");
            return;
        }

        if (temporalAccessibility === "") {
            logOrToast(i18n.t("messages.mandatoryTempAccessibility"), "long");
            return;
        }

        if (photo === "") {
            logOrToast(i18n.t("messages.mandatoryPhoto"), "long");
            return;
        }

        if (locationCategory !== "transportStation")
            transportType = "";

        if (defibrillator)
            putDefibrillator();
        else
            postDefibrillator();

    });

    $("#presence-request").click(() => {

        let toSelect;

        if (presence === "")
            toSelect = "Yes";
        else
            toSelect = presence;

        $("input[name='presence'][value='" + toSelect + "']")
            .prop("checked", "true");

        openDialog($("#dialog-presence"));

    });

    $("#location-category-request").click(() => {

        if (locationCategory === "transportStation")
            $("#transport-type-wrapper").show();
        else
            $("#transport-type-wrapper").hide();

        let categoryToSelect, transportTypeToSelect;

        if (locationCategory === "")
            categoryToSelect = "none";
        else
            categoryToSelect = locationCategory;

        $locationSelect.get(0).selectedIndex =
            $locationSelect.find("option[value=" + categoryToSelect + "]").index();
        changeSelectorLabel("location-select");

        if (transportType === "")
            transportTypeToSelect = "none";
        else
            transportTypeToSelect = transportType;

        $transportTypeSelect.get(0).selectedIndex =
            $transportTypeSelect.find("option[value=" + transportTypeToSelect + "]").index();
        changeSelectorLabel("transport-type-select");

        $("#location-reference").val(visualReference);

        openFullscreenDialog($("#dialog-location"));

    });

    $("#floor-request").click(() => {

        let toShow;

        if (floor === "")
            toShow = "0";
        else
            toShow = floor;

        $("#floor-counter-value").html(toShow.toString());
        newFloor = floor;

        openDialog($("#dialog-floor"));

    });

    $("#temporal-accessibility-request").click(() => {

        let toSelect;

        if (temporalAccessibility === "")
            toSelect = "h24";
        else
            toSelect = temporalAccessibility;

        $("input[name='temporalAccessibility'][value='" + toSelect + "']")
            .prop("checked", "true");

        openDialog($("#dialog-temporal-accessibility"));

    });

    $("#recovery-request").click(() => {

        let toSelect;

        if (recovery === "")
            toSelect = "immediate";
        else
            toSelect = recovery;

        $("input[name='recovery'][value='" + toSelect + "']")
            .prop("checked", "true");

        openDialog($("#dialog-recovery"));

    });

    $("#signage-request").click(() => {

        let toSelect;

        if (signage === "")
            toSelect = "Great";
        else
            toSelect = signage;

        $("input[name='signage'][value='" + toSelect + "']")
            .prop("checked", "true");

        openDialog($("#dialog-signage"));

    });

    $("#notes-request").click(() => {

        $("#brand").val(brand);
        $("#notes").val(notes);

        openFullscreenDialog($("#dialog-notes"));

    });

    $photoThm.click(() => {

        if (photo === "") {
            if (!isCordova)
                $("#tmp-photo-input").click();
            else
                getPicture();
        } else
            openImgScreen(
                $photoThm.find("img").attr("src"),
                true,
                () => {
                    if (!isCordova)
                        $("#tmp-photo-input").click();
                    else
                        getPicture()
                },
                () => removePicturePreview()
            )

    });

}


// Send a post request to the server to insert a new defibrillator in the db
function postDefibrillator() {

    openLoader();

    const formData = new FormData();

    formData.append("coordinates", JSON.stringify(currLatLong));
    formData.append("accuracy", currLatLongAccuracy.toString());
    formData.append("presence", presence);
    formData.append("locationCategory", locationCategory);
    formData.append("transportType", transportType);
    formData.append("visualReference", visualReference);
    formData.append("floor", floor);
    formData.append("temporalAccessibility", temporalAccessibility);
    formData.append("recovery", recovery);
    formData.append("signage", signage);
    formData.append("brand", brand);
    formData.append("notes", notes);

    // ToDo delete
    if (!isCordova) {
        formData.append("image", photo);
        handlePostDefibrillator(formData);
        return;
    }

    formData.append("imageCoordinates", photoCoordinates);
    appendFile(formData, photo, "image", handlePostDefibrillator);

}

function handlePostDefibrillator(formData) {

    fetch(serverUrl + "defibrillator/post?if=def", {
        method : "POST",
        headers: {
            Authorization: "Bearer " + token
        },
        body   : formData
    })
        .then(res => {

            if (res.status !== 201) {
                const err = new Error();
                err.code  = res.status;
                throw err;
            }

            return res.json();
        })
        .then(data => {
            closeLoader();
            showDefibrillator(data.defibrillator._id, data.defibrillator.coordinates);
            closeInsert();
        })
        .catch(err => {
            console.error(err);
            closeLoader();

            if (err.code === 401)
                createAlertDialog(
                    i18n.t("dialogs.title401"),
                    i18n.t("dialogs.postDefibrillator401"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 422)
                logOrToast(i18n("messages.postDefibrillator422"), "long");
            else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.postDefibrillator500"),
                    i18n.t("dialogs.btnOk"));
        });
}


function putDefibrillator() {

    openLoader();

    const formData = new FormData();

    formData.append("presence", presence);
    formData.append("locationCategory", locationCategory);
    formData.append("transportType", transportType);
    formData.append("visualReference", visualReference);
    formData.append("floor", floor);
    formData.append("temporalAccessibility", temporalAccessibility);
    formData.append("recovery", recovery);
    formData.append("signage", signage);
    formData.append("brand", brand);
    formData.append("notes", notes);

    if (photo !== serverUrl + defibrillator.imageUrl) {
        if (!isCordova) {
            formData.append("image", photo);
            handlePutDefibrillator(formData);
        } else {
            formData.append("imageCoordinates", photoCoordinates);
            appendFile(formData, photo, "image", handlePutDefibrillator);
        }
    } else
        handlePutDefibrillator(formData);

}

function handlePutDefibrillator(formData) {

    fetch(serverUrl + "defibrillator/" + defibrillator._id + "?if=def", {
        method : "PUT",
        headers: {
            Authorization: "Bearer " + token
        },
        body   : formData
    })
        .then(res => {

            if (res.status !== 200) {
                const err = new Error();
                err.code  = res.status;
                throw err;
            }

            return res.json();
        })
        .then(data => {

            if (!defibrillator) {
                closeLoader();
                showDefibrillator(data.defibrillator._id, data.defibrillator.coordinates);
                closeInsert();
            } else {
                closeLoader();
                closeInsert();
                openInfo(data.defibrillator._id);
            }
        })
        .catch(err => {
            console.error(err);
            closeLoader();

            if (err.code === 401)
                createAlertDialog(
                    i18n.t("dialogs.title401"),
                    i18n.t("dialogs.putDefibrillator401"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 404)
                createAlertDialog(
                    i18n.t("dialogs.title404"),
                    i18n.t("dialogs.putDefibrillator404"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 422)
                logOrToast(i18n("messages.putDefibrillator422"), "long");
            else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.putDefibrillator500"),
                    i18n.t("dialogs.btnOk"));
        });

}


// Presence
function initPresenceDialog() {

    $("#presence-cancel").click(() => closeDialog($("#dialog-presence")));

    $("#presence-ok").click(() => {

        presence = $("input[name='presence']:checked").val();

        $("#presence-text").html(i18n.t("insert.presence.enum." + presence));

        closeDialog($("#dialog-presence"));

    });

}


// Location category
function initLocationCategoryDialog() {

    $locationSelect.change(() => {

        changeSelectorLabel("location-select");

        if ($locationSelect.val() === "transportStation")
            $("#transport-type-wrapper").show();
        else
            $("#transport-type-wrapper").hide();

    });

    $transportTypeSelect.change(() => changeSelectorLabel("transport-type-select"));

    $("#location-close").click(() => closeFullscreenDialog($("#dialog-location")));

    $("#location-done").click(() => {

        locationCategory = $locationSelect.val();

        if (locationCategory === "none") {
            logOrToast(i18n.t("messages.mandatoryLocationCategory"), "long");
            return;
        }

        transportType = $transportTypeSelect.val();

        if (locationCategory === "transportStation" && transportType === "none") {
            logOrToast(i18n.t("messages.mandatoryTransportType"), "long");
            return;
        }

        visualReference = $("#location-reference").val();

        $("#location-text").html(i18n.t("insert.locationCategory.enum." + locationCategory));

        closeFullscreenDialog($("#dialog-location"));

    });

}


// Floor
function initFloorDialog() {

    $("#floor-counter-add").click(() => {

        if (newFloor === 10)
            return;

        newFloor++;
        $("#floor-counter-value").html(newFloor.toString());

    });

    $("#floor-counter-sub").click(() => {

        if (newFloor === -4)
            return;

        newFloor--;
        $("#floor-counter-value").html(newFloor.toString());

    });

    $("#floor-cancel").click(() => closeDialog($("#dialog-floor")));

    $("#floor-ok").click(() => {

        if (newFloor === "")
            newFloor = 0;

        floor = newFloor;
        $("#floor-text").html(floor.toString());

        closeDialog($("#dialog-floor"));

    });

}


// Temporal accessibility
function initTemporalAccessibilityDialog() {

    $("#temporal-cancel").click(() => closeDialog($("#dialog-temporal-accessibility")));

    $("#temporal-ok").click(() => {

        temporalAccessibility = $("input[name='temporalAccessibility']:checked").val();

        $("#temporal-text").html(i18n.t("insert.temporalAccessibility.enum." + temporalAccessibility));

        closeDialog($("#dialog-temporal-accessibility"));

    });

}


// Recovery
function initRecoveryDialog() {

    $("#recovery-cancel").click(() => closeDialog($("#dialog-recovery")));

    $("#recovery-ok").click(() => {

        recovery = $("input[name='recovery']:checked").val();

        $("#recovery-text").html(i18n.t("insert.recovery.enum." + recovery));

        closeDialog($("#dialog-recovery"));

    });

}


// Signage
function initSignageDialog() {

    $("#signage-cancel").click(() => closeDialog($("#dialog-signage")));

    $("#signage-ok").click(() => {

        signage = $("input[name='signage']:checked").val();

        $("#signage-text").html(i18n.t("insert.signage.enum." + signage));

        closeDialog($("#dialog-signage"));

    });

}


// Notes
function initNotesDialog() {

    $("#notes-close").click(() => closeFullscreenDialog($("#dialog-notes")));

    $("#notes-done").click(() => {

        brand = $("#brand").val();
        notes = $("#notes").val();

        $("#notes-text").html(i18n.t("insert.notes.editText"));

        closeFullscreenDialog($("#dialog-notes"));

    });

}


// Photo

// ToDO delete
$("#tmp-photo-input").change(() => {

    photo = $("#tmp-photo-input")[0].files[0];

    let reader = new FileReader();

    reader.onloadend = e => {

        $photoThm
            .find("img")
            .attr("src", e.target.result)
            .show();

        $photoThm
            .find("i")
            .hide();

    };

    reader.readAsDataURL(photo);

});


function getPicture() {

    let options = {
        quality           : 30,
        destinationType   : Camera.DestinationType.FILE_URI,
        sourceType        : Camera.PictureSourceType.CAMERA,
        encodingType      : Camera.EncodingType.JPEG,
        mediaType         : Camera.MediaType.PICTURE,
        allowEdit         : false,
        correctOrientation: true
    };

    navigator.camera.getPicture(
        fileURI => {

            let res = JSON.parse(fileURI);
            photo   = res.filename;

            let metadata = JSON.parse(res.json_metadata);
            if (metadata && metadata !== {}) {
                if (device.platform === "iOS")
                    photoCoordinates = [metadata.GPS.Latitude, metadata.GPS.Longitude];
                else
                    photoCoordinates = [metadata.gpsLatitude, metadata.gpsLatitude];
            }

            $photoThm
                .find("img")
                .attr("src", photo)
                .show();

            $photoThm
                .find("i")
                .hide();

        },
        err => {
            console.log("Error taking picture", err);
            createAlertDialog("", i18n.t("dialogs.pictureError"), i18n.t("dialogs.btnOk"));
        },
        options);
}

function removePicturePreview() {

    photo = "";

    $photoThm
        .find("img")
        .attr("src", "img/img-placeholder-200.png")
        .hide();

    $photoThm
        .find("i")
        .show();

}


///////////////////////
// UTILITY FUNCTIONS //
///////////////////////

function openFullscreenDialog(dialog) {
    dialog.show();
}

function closeFullscreenDialog(dialog) {
    dialog.scrollTop(0).hide();
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


function resetFields() {

    defibrillator         = null;
    locationCategory      = "";
    transportType         = "";
    visualReference       = "";
    floor                 = "";
    newFloor              = "";
    temporalAccessibility = "";
    recovery              = "";
    signage               = "";
    brand                 = "";
    notes                 = "";
    presence              = "";
    photo                 = "";

    $("#presence-text").html(i18n.t("insert.presence.defaultText"));
    $("#location-text").html(i18n.t("insert.locationCategory.defaultText"));
    $("#floor-text").html(i18n.t("insert.floor.defaultText"));
    $("#temporal-text").html(i18n.t("insert.temporalAccessibility.defaultText"));
    $("#recovery-text").html(i18n.t("insert.recovery.defaultText"));
    $("#signage-text").html(i18n.t("insert.signage.defaultText"));
    $("#notes-text").html(i18n.t("insert.notes.defaultText"));

    $photoThm
        .find("img")
        .attr("src", "img/img-placeholder-200.png")
        .hide();

    $photoThm
        .find("i")
        .show();

}