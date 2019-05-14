"use strict";

const dateOptions = {
    year  : "numeric",
    month : "2-digit",
    day   : "2-digit",
    hour  : "2-digit",
    minute: "2-digit",
    second: "2-digit"
};

let $placeholders = $("#defibrillator-info .placeholder");


function initInfo() {

    $("#info-close").click(() => closeInfo());

    $("#info-photo-thm").click(() => $("#img-screen").show());

}


function openInfo(id) {

    $placeholders.addClass("ph-animate");

    $("#defibrillator-info").show();

    fetch(serverUrl + "defibrillator/" + id)
        .then(res => {
            if (res.status !== 200) {
                throw new Error("Failed to fetch defibrillators");
            }
            return res.json();
        })
        .then(data => {

            $("#info-delete")
                .show()
                .unbind("click")
                .click(() => deleteDefibrillator(data.defibrillator._id));

            $("#info-edit")
                .show()
                .unbind("click")
                .click(() => {
                    $("#defibrillator-info").scrollTop(0);
                    openInsert(data.defibrillator);
                });

            showInfo(data.defibrillator);

            $placeholders.hide().removeClass("ph-animate");
            $("#defibrillator-info .ph-hidden-content").show();

        })
        .catch(err => {
            closeInfo();
            console.log(err);
        });

}

function closeInfo() {

    $("#defibrillator-info").hide().scrollTop(0);

    $("#defibrillator-info .ph-hidden-content").hide();
    $placeholders.removeClass("ph-animate").show();

    $("#info-delete").hide();
    $("#info-edit").hide();

    $("#info-createdAt .info-content").html("");
    $("#info-updatedAt .info-content").html("");
    $("#info-coordinates .info-content").html("");
    $("#info-accuracy .info-content").html("");
    $("#info-presence .info-content").html("");
    $("#info-locationCategory .info-content").html("");
    $("#info-visualReference .info-content").html("");
    $("#info-floor .info-content").html("");
    $("#info-temporalAccessibility .info-content").html("");
    $("#info-recovery .info-content").html("");
    $("#info-signage .info-content").html("");
    $("#info-brand .info-content").html("");
    $("#info-notes .info-content").html("");
    $("#info-photo-preview").attr("src", "img/no-img-placeholder-200.png");
    $("#img-screen-img-container img").attr("src", "");

}


function showInfo(info) {

    for (let key in info) {

        if (info.hasOwnProperty(key) && key !== "transportType")

            $("#info-" + key + " .info-content").html(() => {

                let val = info[key];

                if (val === "")
                    return "-";

                switch (key) {

                    case "createdAt":
                    case "updatedAt":
                        return new Date(val).toLocaleDateString(ln.language, dateOptions);

                    case "coordinates":
                        return val[0] + ", " + val[1];

                    case "accuracy":
                        if (val === 0)
                            return i18n.t("info.accuracyUnknown");
                        if (val === 1)
                            return val + " " + i18n.t("info.accuracyUnitSingle");
                        return val + " " + i18n.t("info.accuracyUnit");

                    case "locationCategory":
                        let content = i18n.t("insert.locationCategory.enum." + val);
                        if (info.transportType !== "")
                            content = content + " (" + info.transportType + ")";
                        return content;

                    case "visualReference":
                    case "floor":
                    case "brand":
                    case "notes":
                        return val;

                    default:
                        return i18n.t("insert." + key + ".enum." + val);
                }

            });
    }

    $("#info-photo-thm").attr("src", serverUrl + info.imageUrl);
    $("#img-screen-img-container img").attr("src", serverUrl + info.imageUrl);

}