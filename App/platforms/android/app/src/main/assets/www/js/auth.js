"use strict";

function initAuth() {

    initLoginPage();
    initRegistrationPage();

}


function initLoginPage() {

    $("#forgot-password").click(() => resetPassword());

    $("#login-btn").click(() => login());

    $("#login-to-register").click(() => {
        $("#register-page-one").show();
        closeLoginPage();
    });

}

function initRegistrationPage() {

    $("#register-age").change(() => changeSelectorLabel("register-age", true));

    $("#register-gender").change(() => changeSelectorLabel("register-gender", true));

    $("#register-occupation").change(() => changeSelectorLabel("register-occupation", true));

    $("#register-btn-next").click(() => registrationNext());

    $("#register-btn-done").click(() => register());

    $("#register-go-back").click(() => $("#register-page-two").hide());

    $(".register-to-login").click(() => closeRegistrationPage());

}


function closeLoginPage() {

    $("#log-in-page").scrollTop(0).hide();
    resetLoginFields();

}

function resetLoginFields() {

    $("#login-email").val("");
    $("#login-password").val("");

}

function closeRegistrationPage() {

    $("#log-in-page").show();

    $("#register-page-one").scrollTop(0).hide();
    $("#register-page-two").scrollTop(0).hide();

    $("#register-email").val("");
    $("#register-password").val("");
    $("#register-confirm-password").val("");

    $("#register-name").val("");
    resetSelector("register-age");
    resetSelector("register-gender");
    resetSelector("register-occupation");
    $("#register-rescuer").prop("checked", false);

}


function registrationNext() {

    openLoader();

    let email           = $("#register-email").val(),
        password        = $("#register-password").val(),
        confirmPassword = $("#register-confirm-password").val();

    // if (email === "") {
    //     logOrToast(i18n.t("messages.mandatoryEmail"), "long");
    //     return;
    // }
    //
    // if (password === "" || password.length < 8 || !(/\d/.test(password))) {
    //     logOrToast(i18n.t("messages.weakPassword"), "long");
    //     return;
    // }
    //
    // if (password !== confirmPassword) {
    //     logOrToast(i18n.t("messages.passwordsNotMatch"), "long");
    //     return;
    // }

    fetch(serverUrl + "auth/check", {
        method : "PUT",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
            email          : email,
            password       : password,
            confirmPassword: confirmPassword
        })
    })
        .then(res => {

            if (res.status !== 200) {
                const err = new Error();
                err.code  = res.status;
                throw err;
            }

            $("#register-page-two").show();
            closeLoader();
        })
        .catch(err => {
            console.error(err);
            closeLoader();

            if (err.code === 409)
                logOrToast(i18n.t("messages.register409"), "long");
            else if (err.code === 422)
                logOrToast(i18n.t("messages.register422"), "long");
            else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.register500"),
                    i18n.t("dialogs.btnOk"));
        });

}


function login() {

    openLoader();

    let email    = $("#login-email").val(),
        password = $("#login-password").val();

    if (email === "" || password === "") {
        closeLoader();
        logOrToast(i18n.t("messages.validCredentials"), "long");
        return;
    }

    fetch(serverUrl + "auth/login", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
            email   : email,
            password: password
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
        .then(resData => {
            isAuth = true;
            token  = resData.token;
            userId = resData.userId;

            localStorage.setItem("token", resData.token);
            localStorage.setItem("userId", resData.userId);

            const remainingMilliseconds = 24 * 60 * 60 * 1000,
                  expireDate            = new Date(new Date().getTime() + remainingMilliseconds);
            localStorage.setItem("expireDate", expireDate.toISOString());
            setAutoLogout(remainingMilliseconds);

            $("#map").show();
            initMap();
            getDefibrillators();
            closeLoginPage();
            closeLoader();
        })
        .catch(err => {
            console.error(err);
            resetLoginFields();
            closeLoader();

            if (err.code === 401)
                logOrToast(i18n.t("messages.login401"), "long");
            else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.login500"),
                    i18n.t("dialogs.btnOk"));
        })

}


function logout() {

    isAuth = false;
    token  = null;
    userId = null;

    localStorage.removeItem("token");
    localStorage.removeItem("expireDate");
    localStorage.removeItem("userId");

}

function setAutoLogout(milliseconds) {
    setTimeout(() => logout(), milliseconds)
}


function register() {

    openLoader();

    let email           = $("#register-email").val(),
        password        = $("#register-password").val(),
        confirmPassword = $("#register-confirm-password").val(),
        name            = $("#register-name").val(),
        age             = $("#register-age").val(),
        gender          = $("#register-gender").val(),
        occupation      = $("#register-occupation").val(),
        isRescuer       = $("#register-rescuer").prop("checked");

    // if (name === "") {
    //     logOrToast(i18n.t("messages.mandatoryName"), "long");
    //     return;
    // }

    fetch(serverUrl + "auth/signup", {
        method : "PUT",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
            email          : email,
            password       : password,
            confirmPassword: confirmPassword,
            name           : name,
            age            : age,
            gender         : gender,
            occupation     : occupation,
            isRescuer      : isRescuer
        })
    })
        .then(res => {

            if (res.status !== 201) {
                const err = new Error();
                err.code  = res.status;
                throw err;
            }

            return res.json();
        })
        .then(resData => {
            closeLoader();
            closeRegistrationPage();
        })
        .catch(err => {
            console.error(err);
            closeLoader();

            if (err.code === 409)
                logOrToast(i18n.t("messages.register409"), "long");
            else if (err.code === 422)
                logOrToast(i18n.t("messages.register422"), "long");
            else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.register500"),
                    i18n.t("dialogs.btnOk"));
        })

}


function resetPassword() {

    let email = $("#login-email").val();

    if (email === "") {
        logOrToast("Provide your email.", "short");
        return;
    }

    console.log("Reset password clicked");

}