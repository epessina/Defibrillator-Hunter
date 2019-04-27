"use strict";

let isModify = false;

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
    photo                 = "";

let $locationSelect      = $("#location-select"),
    $transportTypeSelect = $("#transport-type-select");

let $photoThm = $("#photo-thm");

let btnCancelPhotoTop  = 0,
    btnCancelPhotoLeft = 0;


function initInsert() {

    initMainPage();

    initLocationCategoryDialog();
    initFloorDialog();
    initTemporalAccessibilityDialog();
    initRecoveryDialog();
    initSignageDialog();
    initNotesDialog();
    initPresenceDialog();
    initPhotoDialog();

}

function openInsert(defibrillator = null) {

    if (defibrillator) {

        isModify = true;

        locationCategory      = defibrillator.locationCategory;
        transportType         = defibrillator.transportType;
        visualReference       = defibrillator.visualReference;
        floor                 = defibrillator.floor;
        temporalAccessibility = defibrillator.temporalAccessibility;
        recovery              = defibrillator.recovery;
        signage               = defibrillator.signage;
        brand                 = defibrillator.brand;
        notes                 = defibrillator.notes;
        presence              = defibrillator.presence;

        if (defibrillator.hasPhoto) {
            $("#photo-text").html(i18n.t("insert.photo.editText"));

            if (isApp)
                photo = HOSTED_POINTS_DB + "/" + defibrillator._id + "/image";
            else
                photo = REMOTE_POINTS_DB + "/" + defibrillator._id + "/image";
        }


        $("#location-text").html(i18n.t("insert.locationCategory.enum." + locationCategory));
        $("#floor-text").html(floor);
        $("#temporal-text").html(i18n.t("insert.tempAccessibility.enum." + temporalAccessibility));

        if (recovery !== "")
            $("#recovery-text").html(i18n.t("insert.recovery.enum." + recovery));

        if (signage !== "")
            $("#signage-text").html(i18n.t("insert.signage.enum." + signage));

        if (notes !== "")
            $("#notes-text").html(i18n.t("insert.notes.editText"));

        if (presence !== "")
            $("#presence-text").html(i18n.t("insert.presence.enum." + presence));

    }

    $("#insert-defibrillator").show();

}

function closeInsert() {

    $("#insert-defibrillator").scrollTop(0).hide();

    isModify = false;
    resetFields();

}


// Main page
function initMainPage() {

    $("#new-defibrillator-close").click(() => closeInsert());

    $("#new-defibrillator-done").click(() => {

        // if (locationCategory === "" || floor === "" || temporalAccessibility === "" || presence === "") {
        //     logOrToast("You must provide at least...");
        //     return;
        // }

        if (locationCategory !== "transportStation")
            transportType = "";

        if (isModify)
            console.log("Modified");
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
        changeLocationSelectLabel();

        if (transportType === "")
            transportTypeToSelect = "none";
        else
            transportTypeToSelect = transportType;

        $transportTypeSelect.get(0).selectedIndex =
            $transportTypeSelect.find("option[value=" + transportTypeToSelect + "]").index();
        changeTransportTypeLabel();

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

    $("#photo-request-btn").click(() => {

        if (!isCordova)
            $("#tmp-photo-input").click();
        else
            getPicture();

    });

    $photoThm.click(() => {
        if (photo !== "")
            $("#img-screen").show();
    });

    // $("#photo-request").click(() => {
    //
    //     newPhoto = "";
    //     previewPhoto(photo);
    //
    //     if (photo !== "")
    //         $("#photo-cancel-btn")
    //             .css("left", btnCancelPhotoLeft)
    //             .css("top", btnCancelPhotoTop)
    //             .show();
    //     else
    //         $("#photo-cancel-btn").hide();
    //
    //     openFullscreenDialog($("#dialog-photo"));
    //
    // });

}

// Send a post request to the server to insert a new defibrillator in the db
function postDefibrillator() {

    const formData = new FormData();

    formData.append("coordinates", JSON.stringify(currLatLong));
    formData.append("accuracy", currAccuracy);
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

    if (!isCordova) {
        formData.append("image", photo);
        insertDefibrillator(formData);
    } else
        appendFile(formData, photo);


    // appendFile(
    //     formData,
    //     photo,
    //     "image",
    //     formData => {
    //
    //         console.log("Posting...");
    //
    //         fetch(url, {
    //             method: method,
    //             body  : formData
    //         })
    //             .then(res => {
    //                 if (res.status !== 200 && res.status !== 201) {
    //                     throw new Error("Creating a defibrillator failed!");
    //                 }
    //                 return res.json();
    //             })
    //             .then(data => {
    //                 showDefibrillator(data.defibrillator._id, data.defibrillator.coordinates);
    //                 closeInsert();
    //             })
    //             .catch(err => {
    //                 console.log(err);
    //             });
    //     }
    // );

}

function insertDefibrillator(formData) {

    const url    = serverUrl + "defibrillator/post",
          method = "POST";

    fetch(url, {
        method: method,
        body  : formData
    })
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error("Creating a defibrillator failed!");
            }
            return res.json();
        })
        .then(data => {
            showDefibrillator(data.defibrillator._id, data.defibrillator.coordinates);
            closeInsert();
        })
        .catch(err => {
            console.log(err);
        });
}

// Append the photo to the formData object
function appendFile(formData, fileUri) {

    window.resolveLocalFileSystemURL(
        fileUri,
        fileEntry => {

            fileEntry.file(file => {

                    let reader = new FileReader();

                    reader.onloadend = function () {

                        let blob = new Blob([new Uint8Array(this.result)], { type: "image/jpeg" });

                        formData.append("image", blob);

                        insertDefibrillator(formData);

                    };

                    reader.onerror = fileReadResult => console.log("Reader error", fileReadResult);

                    reader.readAsArrayBuffer(file);
                },
                err => console.log("Error getting the fileEntry file", err)
            )
        },
        err => console.log("Error getting the file", err)
    );
}


// Location category
function initLocationCategoryDialog() {

    $locationSelect.change(() => {

        changeLocationSelectLabel();

        if ($locationSelect.val() === "transportStation")
            $("#transport-type-wrapper").show();
        else
            $("#transport-type-wrapper").hide();

    });

    $transportTypeSelect.change(() => changeTransportTypeLabel());

    $("#location-close").click(() => closeFullscreenDialog($("#dialog-location")));

    $("#location-done").click(() => {

        locationCategory = $locationSelect.val();

        if (locationCategory === "none") {
            console.log("Category none"); // ToDo handle error
            return;
        }

        transportType = $transportTypeSelect.val();

        if (locationCategory === "transportStation" && transportType === "none") {
            console.log("Transport type none"); // ToDo handle error
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


// Presence
function initPresenceDialog() {

    $("#presence-cancel").click(() => closeDialog($("#dialog-presence")));

    $("#presence-ok").click(() => {

        presence = $("input[name='presence']:checked").val();

        $("#presence-text").html(i18n.t("insert.presence.enum." + presence));

        closeDialog($("#dialog-presence"));

    });

}


// Photo

// ToDO delete
$("#tmp-photo-input").change(() => {

    photo = $("#tmp-photo-input")[0].files[0];

    let reader = new FileReader();

    reader.onloadend = e => {
        $("#photo-thm").attr("src", e.target.result);
        $("#photo-request-btn i").html("edit");
    };

    reader.readAsDataURL(photo);

});


function initPhotoDialog() {


    $("#photo-cancel-btn").click(() => {

        newPhoto = "";

        $("#photo-cancel-btn").hide();
        previewPhoto(newPhoto);

        $("#tmp-photo-input").val(""); // ToDo delete

    });


    $("#photo-close").click(() => {

        newPhoto = "";
        closeFullscreenDialog($("#dialog-photo"));

    });

    $("#photo-done").click(() => {

        let $btnCancelPhoto = $("#photo-cancel-btn");

        photo              = newPhoto;
        newPhoto           = "";
        btnCancelPhotoTop  = parseInt($btnCancelPhoto.css("top"));
        btnCancelPhotoLeft = parseInt($btnCancelPhoto.css("left"));

        if (photo === "")
            $("#photo-text").html(i18n.t("insert.photo.name"));
        else
            $("#photo-text").html(i18n.t("insert.photo.editText"));

        closeFullscreenDialog($("#dialog-photo"));

    });

}


function getPicture() {

    let options = {
        quality           : 50,
        destinationType   : Camera.DestinationType.FILE_URI,
        sourceType        : Camera.PictureSourceType.CAMERA,
        encodingType      : Camera.EncodingType.JPEG,
        mediaType         : Camera.MediaType.PICTURE,
        allowEdit         : false,
        correctOrientation: true
    };

    navigator.camera.getPicture(getPictureSuccess, getPictureFail, options);
}

function getPictureSuccess(fileURI) {

    photo = fileURI;

    $photoThm.attr("src", photo);
    $("#img-screen-img-container img").attr("src", photo);

    $("#photo-request-btn i").html("edit");

    // window.resolveLocalFileSystemURL(fileURI, fileEntry => {
    //
    //         fileEntry.file(file => {
    //
    //             let reader = new FileReader();
    //
    //             reader.onloadend = e => {
    //
    //                 let img = new Image();
    //                 img.src = e.target.result;
    //
    //                 img.onload = () => {
    //
    //                     const ratio         = img.width / img.height,
    //                           imgDefaultDim = 300;
    //
    //                     if (ratio >= 1) {
    //                         $photoThm.css("height", imgDefaultDim);
    //                         $photoThm.css("width", imgDefaultDim * ratio);
    //                     } else {
    //                         $photoThm.css("width", imgDefaultDim);
    //                         $photoThm.css("height", imgDefaultDim / ratio);
    //                     }
    //
    //                     $photoThm.attr("src", photo);
    //                     $("#img-screen-img-container img").attr("src", photo);
    //
    //                     $("#photo-request-btn i").html("edit");
    //
    //                     img = null;
    //                 }
    //             };
    //
    //             reader.onerror = fileReadResult => console.log("Reader error", fileReadResult);
    //
    //             reader.readAsDataURL(file)
    //
    //         }, err => console.log("Error reading the file", err));
    //
    //     }
    // )


// let $btnCancelPhoto = $("#photo-cancel-btn");
//
// console.log("Picture success");
//
// newPhoto = data;
//
// let img    = new Image();
// img.src    = "data:image/jpeg;base64," + data;
// img.onload = () => {
//
//     let imgWidth  = img.width,
//         imgHeight = img.height,
//         ratio     = imgWidth / imgHeight;
//
//     if (ratio >= 1) {
//         if (imgWidth > 200) {
//             imgWidth  = 200;
//             imgHeight = imgWidth / ratio;
//         }
//     } else {
//         if (imgHeight > 200) {
//             imgHeight = 200;
//             imgWidth  = imgHeight * ratio;
//         }
//     }
//
//     let $photoPreviewWrapper = $("#photo-preview-wrapper");
//
//     previewPhoto(data);
//
//     let top = parseInt($(".top-bar").first().css("height")) +
//         parseInt($("#photo-dialog-container").css("margin-top")) +
//         parseInt($photoPreviewWrapper.css("height")) / 2 -
//         imgHeight / 2 -
//         parseInt($btnCancelPhoto.css("height"));
//
//     let left = $(document).width() / 2 +
//         imgWidth / 2 -
//         parseInt($btnCancelPhoto.css("height")) / 2;
//
//     $btnCancelPhoto.css("left", left).css("top", top).show();
// };

}

function getPictureFail(error) {
    console.log("Picture error: " + error)
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


function changeLocationSelectLabel() {

    let label = $("[for='location-select']").find(".label-description");

    if ($locationSelect.val() === "none")
        label.html(i18n.t("insert.locationCategory.defaultLabelCategory"));
    else
        label.html($locationSelect.find("option:selected").text());

}

function changeTransportTypeLabel() {

    let label = $("[for='transport-type-select']").find(".label-description");

    if ($transportTypeSelect.val() === "none")
        label.html(i18n.t("insert.locationCategory.defaultLabelTransport"));
    else
        label.html($transportTypeSelect.find("option:selected").text());

}


function previewPhoto(photo) {

    if (photo === "") {
        $("#def-photo-preview").attr("src", "img/img-placeholder-200.png");
    } else {
        if (isModify)
            $("#def-photo-preview").attr("src", photo);
        else
            $("#def-photo-preview").attr("src", "data:image/jpeg;base64," + photo);
    }
}


function resetFields() {

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

    $("#location-text").html(i18n.t("insert.locationCategory.defaultText"));
    $("#floor-text").html(i18n.t("insert.floor.defaultText"));
    $("#temporal-text").html(i18n.t("insert.temporalAccessibility.defaultText"));
    $("#recovery-text").html(i18n.t("insert.recovery.defaultText"));
    $("#signage-text").html(i18n.t("insert.signage.defaultText"));
    $("#notes-text").html(i18n.t("insert.notes.defaultText"));
    $("#presence-text").html(i18n.t("insert.presence.defaultText"));
    $("#photo-thm").attr("src", "img/img-placeholder-200.png");
    $("#photo-request-btn i").html("add_a_photo");
    $("#img-screen-img-container img").attr("src", "");

}