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

    initSettings();
}

function initSettings() {

    $("#profile-settings").click(() => openSettings());

    $("#profile-settings-overlay").click(() => closeSettings());

    $("#settings-language").click(() => logOrToast("Function not yet implemented", "short"));

    $("#settings-editProfile").click(() => logOrToast("Function not yet implemented", "short"));

    $("#settings-changePassword").click(() => logOrToast("Function not yet implemented", "short"));

    $("#settings-logout").click(() => {

        closeSettings();

        createAlertDialog(
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

    fetch(serverUrl + "auth/" + userId, { //ToDo change
        headers: {
            Authorization: "Bearer " + token
        }
    })
        .then(res => {
            if (res.status !== 200) {
                throw new Error("Failed to fetch the user");
            }
            return res.json();
        })
        .then(data => {
            populateProfile(data.user);
        })
        .catch(err => {
            createAlertDialog(i18n.t("dialogs.info.errorGetUser"), i18n.t("dialogs.btnOk"));
            closeProfilePage();
            console.error("Retrieving user failed", err);
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