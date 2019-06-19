"use strict";

let userData = undefined;

let activeTab = "profile-dashboard";

let $profilePlaceholders = $("#profile .placeholder");


function initProfilePage() {

    $("#profile-back").click(() => closeProfilePage());

    $("#profile .tab-label").click(function () {
        changeProfileTab($(this));
    });

    $("#profile-tabs-content")
        .on("swipeleft", () => handleTabSwipe("left"))
        .on("swiperight", () => handleTabSwipe("right"));

    // Initialize settings;
    initSettings();

    // Initialize photo menu
    initProfilePhoto();

    // Initialize change email
    $("#change-email-close").click(() => closeChangeEmail());
    $("#change-email-done").click(() => changeEmail());

    // Initialize change password page
    $("#change-pw-close").click(() => closeChangePassword());
    $("#change-pw-done").click(() => changePassword());

    // Initialize edit profile page
    initEditProfile();

    // openProfilePage(); //ToDo remove

}

function initSettings() {

    $("#profile-settings").click(() => openSettings());

    $("#profile-settings-overlay").click(() => closeSettings());

    $("#settings-language").click(() => logOrToast("Function not yet implemented", "short"));

    $("#settings-editProfile").click(() => openEditProfile());

    $("#settings-changeEmail").click(() => {
        $("#change-email").show();
        closeSettings();
    });

    $("#settings-changePassword").click(() => {
        $("#change-pw").show();
        closeSettings();
    });

    $("#settings-logout").click(() => {
        closeSettings();

        createAlertDialog(
            "",
            i18n.t("dialogs.logoutConfirmation"),
            i18n.t("dialogs.btnCancel"),
            null,
            i18n.t("dialogs.btnOk"),
            () => {
                closeProfilePage();
                $("body").children("div").hide();
                $("#log-in-page").show();
                logout();
            }
        );

    });

}

function initEditProfile() {

    $("#edit-profile-close").click(() => closeEditProfile());
    $("#edit-profile-done").click(() => editProfile());

    $("#edit-profile-age").change(() => changeSelectorLabel("edit-profile-age", true));

    $("#edit-profile-gender").change(() => changeSelectorLabel("edit-profile-gender", true));

    $("#edit-profile-occupation").change(() => changeSelectorLabel("edit-profile-occupation", true));

}

function initProfilePhoto() {

    $("#profile-photo").click(() => {

        if ($("#profile-photo").attr("src") !== "img/default-profile-img-120.png")
            $("#profile-photo-delete").show();

        $("#profile-photo-dialog-overlay").show();

    });

    $("#profile-photo-camera").click(() => {
        closeProfilePhotoMenu();
        getProfilePhoto(true);
    });

    $("#profile-photo-gallery").click(() => {
        closeProfilePhotoMenu();
        getProfilePhoto(false);
    });

    $("#profile-photo-delete").click(() => {
        closeProfilePhotoMenu();

        createAlertDialog(
            "",
            i18n.t("profile.photoDialog.deleteConfirmation"),
            i18n.t("dialogs.btnCancel"),
            null,
            i18n.t("dialogs.btnOk"),
            () => putProfileImage(new FormData())
        );
    });

    $("#profile-photo-cancel").click(() => closeProfilePhotoMenu());

}


function openProfilePage() {

    $profilePlaceholders.addClass("ph-animate");

    $("#profile").show();

    fetch(serverUrl + "profile/" + userId, {
        headers: {
            "App-Key"    : APIKey,
            Authorization: "Bearer " + token
        }
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
            userData = data.user;
            populateProfile();
        })
        .catch(err => {
            console.error(err);
            closeProfilePage();

            if (err.code === 401)
                createAlertDialog(
                    i18n.t("dialogs.title401"),
                    i18n.t("dialogs.getUser401"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 403)
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 404)
                createAlertDialog(
                    i18n.t("dialogs.title404"),
                    i18n.t("dialogs.getUser404"),
                    i18n.t("dialogs.btnOk"));
            else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.getUser500"),
                    i18n.t("dialogs.btnOk"));
        });

}

function closeProfilePage() {

    $("#profile").scrollTop(0).hide();

    userData = undefined;

    $("#profile-settings").css("visibility", "hidden");

    activeTab = "profile-dashboard";
    changeProfileTab($("#tab-" + activeTab));

    $("#profile-name").html("");
    $("#mapped-def-number").html("");
    $("#profile-mail .info-content").html("");
    $("#profile-age .info-content").html("");
    $("#profile-gender .info-content").html("");
    $("#profile-occupation .info-content").html("");
    $("#profile-rescuer .info-content").html("");

    $("#profile-photo").attr("src", "img/default-profile-img-120.png");

    $("#profile .ph-hidden-content").hide();
    $profilePlaceholders.removeClass("ph-animate").show();

}


function openSettings() {
    $("#profile-settings-overlay").show();
    $("#profile-settings-menu").show();
}

function closeSettings() {
    $("#profile-settings-menu").hide();
    $("#profile-settings-overlay").hide();
}


function populateProfile() {

    $("#profile-name").html(userData.name);

    $("#mapped-def-number").html(userData.defNumber);
    if (userData.defNumber === 1)
        $("#mapped-def-text").html(i18n.t("profile.defMappedSingle"));
    else
        $("#mapped-def-text").html(i18n.t("profile.defMappedPlural"));

    $("#profile-mail .info-content").html(userData.email);
    $("#profile-age .info-content").html(i18n.t("auth.register.ageEnum." + userData.age));
    $("#profile-gender .info-content").html(i18n.t("auth.register.genderEnum." + userData.gender));
    $("#profile-occupation .info-content").html(i18n.t("auth.register.occupationEnum." + userData.occupation));

    let rescuer = "no";
    if (userData.isRescuer)
        rescuer = "yes";
    $("#profile-rescuer .info-content").html(i18n.t("profile." + rescuer));

    $("#profile-settings").css("visibility", "visible");

    if (userData.imageUrl !== "")
        $("#profile-photo").attr("src", serverUrl + userData.imageUrl);

    $profilePlaceholders.hide().removeClass("ph-animate");
    $("#profile .ph-hidden-content").show();

}


function handleTabSwipe(dir) {

    if (dir === "left" && activeTab !== "profile-about")
        changeProfileTab($("#tab-" + "profile-about"));
    else if (dir === "right" && activeTab !== "profile-dashboard")
        changeProfileTab($("#tab-" + "profile-dashboard"));

}

function changeProfileTab($tab) {

    let id    = $tab.attr("id");
    activeTab = id.substring(4, id.length);

    $(".tab-label").removeClass("tab-active");
    $("#tab-" + activeTab).addClass("tab-active");

    $(".tab-content").hide();
    $("#" + activeTab).show();

}


function changeEmail() {

    openLoader();

    let email = $("#new-email").val();

    if (email === "") {
        closeLoader();
        logOrToast(i18n.t("messages.mandatoryEmail"), "long");
        return;
    }

    fetch(serverUrl + "profile/" + userId + "/change-email", {
        method : "PUT",
        headers: {
            "App-Key"     : APIKey,
            Authorization : "Bearer " + token,
            "Content-Type": "application/json"
        },
        body   : JSON.stringify({
            email    : email
        })
    })
        .then(res => {

            if (res.status !== 200) {
                const err = new Error();
                err.code  = res.status;
                throw err;
            }

            closeLoader();
            closeChangeEmail();
            closeProfilePage();
            $("body").children("div").hide();
            $("#log-in-page").show();
            logout();
            createAlertDialog(
                i18n.t("profile.changeEmail.successTitle"),
                i18n.t("profile.changeEmail.successMessage"),
                i18n.t("dialogs.btnOk"));
        })
        .catch(err => {
            console.error(err);
            closeLoader();

            if (err.code === 401)
                createAlertDialog(
                    i18n.t("dialogs.title401"),
                    i18n.t("dialogs.changeEmail401"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 403)
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 404)
                createAlertDialog(
                    i18n.t("dialogs.title404"),
                    i18n.t("dialogs.changeEmail404"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 409)
                logOrToast(i18n.t("messages.changeEmail409"), "long");
            else if (err.code === 422) {
                logOrToast(i18n.t("messages.mandatoryEmail"), "long");
            } else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.changeEmail500"),
                    i18n.t("dialogs.btnOk"));
        });

}

function closeChangeEmail() {
    $("#change-email").scrollTop(0).hide();
    $("#new-email").val("");
}


function changePassword() {

    openLoader();

    let oldPassword     = $("#change-pw-old-password").val(),
        newPassword     = $("#change-pw-new-password").val(),
        confirmPassword = $("#change-pw-confirm-password").val();

    if (oldPassword === "") {
        logOrToast(i18n.t("messages.insertOldPassword"), "long");
        return;
    }

    if (newPassword === "" || newPassword.length < 8 || !(/\d/.test(newPassword))) {
        logOrToast(i18n.t("messages.weakNewPassword"), "long");
        return;
    }

    if (oldPassword === newPassword) {
        logOrToast(i18n.t("messages.samePassword"), "long");
        return;
    }

    if (newPassword !== confirmPassword) {
        logOrToast(i18n.t("messages.passwordsNotMatch"), "long");
        return;
    }

    fetch(serverUrl + "profile/" + userId + "/change-password", {
        method : "PUT",
        headers: {
            "App-Key"     : APIKey,
            Authorization : "Bearer " + token,
            "Content-Type": "application/json"
        },
        body   : JSON.stringify({
            oldPassword    : oldPassword,
            newPassword    : newPassword,
            confirmPassword: confirmPassword
        })
    })
        .then(res => {

            if (res.status !== 200) {
                const err = new Error();
                err.code  = res.status;
                throw err;
            }

            closeLoader();
            closeChangePassword();
        })
        .catch(err => {
            console.error(err);
            closeLoader();
            resetChangePassword();

            if (err.code === 401)
                createAlertDialog(
                    i18n.t("dialogs.title401"),
                    i18n.t("dialogs.changePw401"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 403)
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 404)
                createAlertDialog(
                    i18n.t("dialogs.title404"),
                    i18n.t("dialogs.changePw404"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 422) {
                logOrToast(i18n.t("messages.changePw422"), "long");
            } else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.changePw500"),
                    i18n.t("dialogs.btnOk"));
        });


}

function closeChangePassword() {
    $("#change-pw").scrollTop(0).hide();
    resetChangePassword();
}

function resetChangePassword() {
    $("#change-pw-old-password").val("");
    $("#change-pw-new-password").val("");
    $("#change-pw-confirm-password").val("");
}


function editProfile() {

    openLoader();

    const name       = $("#edit-profile-name").val(),
          age        = $("#edit-profile-age").val(),
          gender     = $("#edit-profile-gender").val(),
          occupation = $("#edit-profile-occupation").val(),
          isRescuer  = $("#edit-profile-rescuer").prop("checked");

    if (name === "") {
        logOrToast(i18n.t("messages.mandatoryName"), "long");
        return;
    }

    fetch(serverUrl + "profile/" + userId + "/update-profile", {
        method : "PUT",
        headers: {
            "App-Key"     : APIKey,
            Authorization : "Bearer " + token,
            "Content-Type": "application/json"
        },
        body   : JSON.stringify({
            name      : name,
            age       : age,
            gender    : gender,
            occupation: occupation,
            isRescuer : isRescuer
        })
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

            userData = data.user;
            populateProfile();

            closeLoader();
            closeEditProfile();
        })
        .catch(err => {
            console.error(err);
            closeLoader();

            if (err.code === 401)
                createAlertDialog(
                    i18n.t("dialogs.title401"),
                    i18n.t("dialogs.editProfile401"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 403)
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 404)
                createAlertDialog(
                    i18n.t("dialogs.title404"),
                    i18n.t("dialogs.editProfile404"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 422) {
                logOrToast(i18n.t("messages.editProfile422"), "long");
            } else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.editProfile500"),
                    i18n.t("dialogs.btnOk"));
        });

}

function openEditProfile() {

    $("#edit-profile-name").val(userData.name);

    if (userData.age !== "none") {
        $("#edit-profile-age").val(userData.age);
        changeSelectorLabel("edit-profile-age", true);
    }

    if (userData.gender !== "none") {
        $("#edit-profile-gender").val(userData.gender);
        changeSelectorLabel("edit-profile-gender", true);
    }

    if (userData.occupation !== "none") {
        $("#edit-profile-occupation").val(userData.occupation);
        changeSelectorLabel("edit-profile-occupation", true);
    }

    if (userData.isRescuer)
        $("#edit-profile-rescuer").prop("checked", true);

    $("#edit-profile").show();
    closeSettings();

}

function closeEditProfile() {

    $("#edit-profile").scrollTop(0).hide();

    $("#edit-profile-name").val("");

    $("#edit-profile-age").val("");
    changeSelectorLabel("edit-profile-age", true);

    $("#edit-profile-gender").val("");
    changeSelectorLabel("edit-profile-gender", true);

    $("#edit-profile-occupation").val("");
    changeSelectorLabel("edit-profile-occupation", true);

    $("#edit-profile-rescuer").prop("checked", false);

}


function closeProfilePhotoMenu() {
    $("#profile-photo-dialog-overlay").hide();
    $("#profile-photo-delete").hide();
}

function getProfilePhoto(fromCamera) {

    // ToDo delete
    if (!isCordova) {
        $("#tmp-profile-photo-input").click();
        return;
    }

    let options = {
        quality           : 50,
        destinationType   : Camera.DestinationType.FILE_URI,
        sourceType        : Camera.PictureSourceType.CAMERA,
        encodingType      : Camera.EncodingType.JPEG,
        mediaType         : Camera.MediaType.PICTURE,
        allowEdit         : false,
        correctOrientation: true
    };

    if (!fromCamera)
        options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;

    navigator.camera.getPicture(
        fileURI => {
            openLoader();

            let res = JSON.parse(fileURI);
            photo   = res.filename;

            const formData = new FormData();
            appendFile(formData, photo, "profileImage", putProfileImage);
        },
        err => {
            console.log("Error taking picture", err);
            createAlertDialog("", i18n.t("dialogs.pictureError"), i18n.t("dialogs.btnOk"));
        },
        options);

}

// ToDO delete
$("#tmp-profile-photo-input").change(() => {

    let photo = $("#tmp-profile-photo-input")[0].files[0];

    let reader = new FileReader();

    reader.onloadend = e => {
        openLoader();
        const formData = new FormData();
        formData.append("image", photo);
        putProfileImage(formData);
    };

    reader.readAsDataURL(photo);

});

function putProfileImage(formData) {

    fetch(serverUrl + "profile/" + userId + "/update-picture?if=prof", {
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

            if (data.imageUrl !== "")
                $("#profile-photo").attr("src", serverUrl + data.imageUrl);
            else
                $("#profile-photo").attr("src", "img/default-profile-img-120.png");

            closeLoader();
        })
        .catch(err => {
            console.error(err);
            closeLoader();

            if (err.code === 401)
                createAlertDialog(
                    i18n.t("dialogs.title401"),
                    i18n.t("dialogs.putProfileImage401"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 403)
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 404)
                createAlertDialog(
                    i18n.t("dialogs.title404"),
                    i18n.t("dialogs.putProfileImage404"),
                    i18n.t("dialogs.btnOk"));
            else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.putProfileImage500"),
                    i18n.t("dialogs.btnOk"));
        });

}