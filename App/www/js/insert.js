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

    $("#page--insert").show();

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

    console.log(photoCoordinates);
    formData.append("imageCoordinates", photoCoordinates);
    appendFile(formData, photo, "image", handlePostDefibrillator);

}

function handlePostDefibrillator(formData) {

    fetch(serverUrl + "defibrillator/post?if=def", {
        method : "POST",
        headers: {
            "App-Key"    : APIKey,
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
            else if (err.code === 403)
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
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
            "App-Key"    : APIKey,
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
            else if (err.code === 403)
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
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



