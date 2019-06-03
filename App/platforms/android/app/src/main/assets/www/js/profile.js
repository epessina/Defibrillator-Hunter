"use strict";

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

    // Initialize change password page
    $("#change-pw-close").click(() => closeChangePassword());
    $("#change-pw-done").click(() => changePassword());

}

function initSettings() {

    $("#profile-settings").click(() => openSettings());

    $("#profile-settings-overlay").click(() => closeSettings());

    $("#settings-language").click(() => logOrToast("Function not yet implemented", "short"));

    $("#settings-editProfile").click(() => logOrToast("Function not yet implemented", "short"));

    $("#settings-changePassword").click(() => {
        closeSettings();
        $("#change-pw").show();
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
                $("body").children("div").hide();
                $("#log-in-page").show();
                logout();
            }
        );

    });

}


function openProfilePage() {

    $profilePlaceholders.addClass("ph-animate");

    $("#profile").show();

    fetch(serverUrl + "auth/" + userId, {
        headers: {
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
        .then(data => populateProfile(data.user))
        .catch(err => {
            console.error(err);
            closeProfilePage();

            if (err.code === 401)
                createAlertDialog(
                    i18n.t("dialogs.title401"),
                    i18n.t("dialogs.getUser401"),
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


function populateProfile(data) {

    $("#profile-name").html(data.name);

    $("#mapped-def-number").html(data.defNumber);
    if (data.defNumber === 1)
        $("#mapped-def-text").html(i18n.t("profile.defMappedSingle"));
    else
        $("#mapped-def-text").html(i18n.t("profile.defMappedPlural"));

    $("#profile-mail .info-content").html(data.email);
    $("#profile-age .info-content").html(i18n.t("auth.register.ageEnum." + data.age));
    $("#profile-gender .info-content").html(i18n.t("auth.register.genderEnum." + data.gender));
    $("#profile-occupation .info-content").html(i18n.t("auth.register.occupationEnum." + data.occupation));

    let rescuer = "no";
    if (data.isRescuer)
        rescuer = "yes";
    $("#profile-rescuer .info-content").html(i18n.t("profile." + rescuer));

    $("#profile-settings").css("visibility", "visible");

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


function changePassword() {

    openLoader();

    let oldPassword     = $("#change-pw-old-password").val(),
        newPassword     = $("#change-pw-new-password").val(),
        confirmPassword = $("#change-pw-confirm-password").val();

    // if (oldPassword === "") {
    //     logOrToast(i18n.t("messages.insertOldPassword"), "long");
    //     return;
    // }
    //
    // if (newPassword === "" || newPassword.length < 8 || !(/\d/.test(newPassword))) {
    //     logOrToast(i18n.t("messages.weakNewPassword"), "long");
    //     return;
    // }
    //
    // if (oldPassword === newPassword) {
    //     logOrToast(i18n.t("messages.samePassword"), "long");
    //     return;
    // }
    //
    // if (newPassword !== confirmPassword) {
    //     logOrToast(i18n.t("messages.passwordsNotMatch"), "long");
    //     return;
    // }

    fetch(serverUrl + "auth/" + userId + "/change-password", {
        method : "POST",
        headers: {
            Authorization: "Bearer " + token,
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