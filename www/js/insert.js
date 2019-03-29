"use strict";

let locationCategory      = "",
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
    newPhoto              = "";

let $locationSelect = $("#location-select");

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

function openInsert() {

    $("#insert-defibrillator-main").show();

}


// Main page
function initMainPage() {

    $("#new-defibrillator-close").click(() => {

        // $("#insert-defibrillator").hide();
        // $("#map").show();

        resetFields();

    });

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

        console.log(defibrillator);

        // $("#insert-defibrillator").hide();
        // $("#map").show();

        // resetFields();

    });

    $("#location-category-request").click(() => {

        let toSelect;

        if (locationCategory === "")
            toSelect = "none";
        else
            toSelect = locationCategory;

        $locationSelect.get(0).selectedIndex = $locationSelect.find("option[value=" + toSelect + "]").index();
        changeLocationSelectLabel();

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

    $("#photo-request").click(() => {

        newPhoto = "";
        previewPhoto(photo);

        if (photo !== "")
            $("#photo-cancel-btn")
                .css("left", btnCancelPhotoLeft)
                .css("top", btnCancelPhotoTop)
                .show();
        else
            $("#photo-cancel-btn").hide();

        openFullscreenDialog($("#dialog-photo"));

    });

}


// Location category
function initLocationCategoryDialog() {

    $locationSelect.change(() => changeLocationSelectLabel());

    $("#location-close").click(() => closeFullscreenDialog($("#dialog-location")));

    $("#location-done").click(() => {

        locationCategory = $("#location-select").val();

        if (locationCategory === "none") {
            console.log("Category none"); // ToDo handle error
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

        $("#temporal-text").html(i18n.t("insert.tempAccessibility.enum." + temporalAccessibility));

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
function initPhotoDialog() {

    // ToDO delete
    $("#tmp-photo-input").change(() => {

        console.log("Change");

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

        let $btnCancelPhoto = $("#photo-cancel-btn");

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
                parseInt($("#photo-dialog-container").css("margin-top")) +
                parseInt($photoPreviewWrapper.css("height")) / 2 -
                imgHeight / 2 -
                parseInt($btnCancelPhoto.css("height"));

            let left = $(document).width() / 2 +
                imgWidth / 2 -
                parseInt($btnCancelPhoto.css("height")) / 2;

            $btnCancelPhoto.css("left", left).css("top", top).show();
        };

    }

    function getPictureFail(error) {
        console.log("Picture error: " + error)
    }


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


///////////////////////
// UTILITY FUNCTIONS //
///////////////////////

function openFullscreenDialog(dialog) {
    dialog.show();
}

function closeFullscreenDialog(dialog) {
    dialog.hide();
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
        label.html(i18n.t("insert.locationCategory.defaultLabel"));
    else {
        label.html($locationSelect.find("option:selected").text());
    }

}


function previewPhoto(photo) {

    if (photo === "")
        $("#def-photo-preview").attr("src", "img/img-placeholder-200.png");

    else
        $("#def-photo-preview").attr("src", "data:image/jpeg;base64," + photo);
}


function resetFields() {

    locationCategory      = "";
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
    newPhoto              = "";

    $("#location-text").html("Add a category");
    $("#floor-text").html("Specify the floor");
    $("#temporal-text").html("Specify the temporal accessibility");
    $("#recovery-text").html("Specify the ease of recovery");
    $("#signage-text").html("Evaluate the signage");
    $("#notes-text").html("Add additional notes");
    $("#presence-text").html("Confirm the presence");
    $("#photo-text").html("Add a photo");

}