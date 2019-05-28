"use strict";

let activeTab = "profile-dashboard";


function initProfilePage() {

    $("#profile-back").click(() => closeProfilePage());

    $("#profile-settings").click(() => {
        $("#profile-settings-overlay").show();
        $("#profile-settings-menu").show();
    });

    $("#profile-settings-overlay").click(() => {
        $("#profile-settings-menu").hide();
        $("#profile-settings-overlay").hide();
    });

    $("#profile .tab-label").click(function () {
        changeProfileTab($(this));
    });

    $("#profile-tabs-content")
        .on("swipeleft", () => handleTabSwipe("left"))
        .on("swiperight", () => handleTabSwipe("right"))

}

function openProfilePage() {

    $("#profile").show();

}

function closeProfilePage() {

    $("#profile").scrollTop(0).hide();

    activeTab = "profile-dashboard";
    changeProfileTab();

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