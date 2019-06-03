"use strict";

const dateOptions = {
    year  : "numeric",
    month : "2-digit",
    day   : "2-digit",
    hour  : "2-digit",
    minute: "2-digit",
    second: "2-digit"
};

let defibrillatorData = undefined,
    $infoPlaceholders = $("#defibrillator-info .placeholder");


function initInfo() {

    $("#info-close").click(() => closeInfo());

    $("#info-photo-thm").click(function () {
        openImgScreen($(this).attr("src"));
    });

}


function openInfo(id) {

    $infoPlaceholders.addClass("ph-animate");

    $("#defibrillator-info").show();

    fetch(serverUrl + "defibrillator/" + id, {
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
        .then(data => {
            defibrillatorData = data.defibrillator;

            $("#info-delete")
                .show()
                .unbind("click")
                .click(() => {
                    createAlertDialog(
                        "",
                        i18n.t("dialogs.deleteConfirmation"),
                        i18n.t("dialogs.btnCancel"),
                        null,
                        i18n.t("dialogs.btnOk"),
                        () => deleteDefibrillator(defibrillatorData._id)
                    );

                });

            $("#info-edit")
                .show()
                .unbind("click")
                .click(() => {
                    openInsert(defibrillatorData);
                });

            showInfo();

        })
        .catch(err => {
            console.error(err);
            closeInfo();

            if (err.code === 401)
                createAlertDialog(
                    i18n.t("dialogs.title401"),
                    i18n.t("dialogs.getDefibrillator401"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 404)
                createAlertDialog(
                    i18n.t("dialogs.title404"),
                    i18n.t("dialogs.getDefibrillator404"),
                    i18n.t("dialogs.btnOk"));
            else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.getDefibrillator500"),
                    i18n.t("dialogs.btnOk"));
        });

}

function closeInfo() {

    $("#defibrillator-info").scrollTop(0).hide();

    $("#defibrillator-info .ph-hidden-content").hide();
    $infoPlaceholders.removeClass("ph-animate").show();

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

    defibrillatorData = undefined;

}


function showInfo() {

    for (let key in defibrillatorData) {

        if (defibrillatorData.hasOwnProperty(key) && key !== "transportType")

            $("#info-" + key + " .info-content").html(() => {

                let val = defibrillatorData[key];

                if (val === "")
                    return "-";

                switch (key) {

                    case "createdAt":
                    case "updatedAt":
                        return new Date(val).toLocaleDateString(ln.language, dateOptions);

                    case "coordinates":
                        return val[0] + ", " + val[1];

                    case "accuracy":
                        if (val === 0 || val === null)
                            return i18n.t("info.unknown");
                        return val + " " + i18n.t("info.accuracyUnit");

                    case "locationCategory":
                        let content = i18n.t("insert.locationCategory.enum." + val);
                        if (defibrillatorData.transportType !== "")
                            content = content + " (" + defibrillatorData.transportType + ")";
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

    $("#info-photo-thm").attr("src", serverUrl + defibrillatorData.imageUrl);
    $infoPlaceholders.hide().removeClass("ph-animate");
    $("#defibrillator-info .ph-hidden-content").show();

}