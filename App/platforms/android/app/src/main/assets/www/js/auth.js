"use strict";

function initAuth() {

    initLoginPage();
    initRegistrationPage();

    $("#reset-pw-close").click(() => closeResetPwPage());
    $("#reset-pw-done").click(() => resetPassword());


    $("#resend-email-close").click(() => closeResendEmailPage());
    $("#resend-email-done").click(() => resendConfirmationEmail());

}


function initLoginPage() {

    $("#forgot-password").click(() => $("#reset-pw").show());

    $("#login-btn").click(() => login());

    $("#login-to-register").click(() => {
        $("#register-disclaimer").show();
        closeLoginPage();
    });

}

function initRegistrationPage() {

    $("#register-disclaimer-btn-accept").click(() => {
        $("#register-page-one").show();
        $("#register-disclaimer").scrollTop(0).hide();
    });

    $("#register-disclaimer-go-back").click(() => {
        $("#log-in-page").show();
        $("#register-disclaimer").scrollTop(0).hide();
    });

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

    if (email === "") {
        logOrToast(i18n.t("messages.mandatoryEmail"), "long");
        return;
    }

    if (password === "" || password.length < 8 || !(/\d/.test(password))) {
        logOrToast(i18n.t("messages.weakPassword"), "long");
        return;
    }

    if (password !== confirmPassword) {
        logOrToast(i18n.t("messages.passwordsNotMatch"), "long");
        return;
    }

    fetch(serverUrl + "auth/check", {
        method : "PUT",
        headers: {
            "App-Key"     : APIKey,
            "Content-Type": "application/json"
        },
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

            if (err.code === 403)
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 409)
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

function register() {

    openLoader();

    const email           = $("#register-email").val(),
          password        = $("#register-password").val(),
          confirmPassword = $("#register-confirm-password").val(),
          name            = $("#register-name").val(),
          age             = $("#register-age").val(),
          gender          = $("#register-gender").val(),
          occupation      = $("#register-occupation").val(),
          isRescuer       = $("#register-rescuer").prop("checked");

    if (name === "") {
        logOrToast(i18n.t("messages.mandatoryName"), "long");
        return;
    }

    fetch(serverUrl + "auth/signup", {
        method : "PUT",
        headers: {
            "App-Key"     : APIKey,
            "Content-Type": "application/json"
        },
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
        .then(() => {
            closeLoader();
            closeRegistrationPage();

            createAlertDialog(
                i18n.t("auth.register.successTitle"),
                i18n.t("auth.register.successMessage"),
                i18n.t("dialogs.btnOk"));
        })
        .catch(err => {
            console.error(err);
            closeLoader();

            if (err.code === 403)
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 409)
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


function createResendEmailDialog() {

    $alertOverlay.find(".dialog-title").html(i18n.t("auth.login.notVerifiedTitle"));

    $alertOverlay.find(".dialog-text").html(`
        <p>${i18n.t("auth.login.notVerifiedMessage")}</p>
        <p class="dialog-link" onclick="openResendEmailPage()">
            ${i18n.t("auth.login.resendEmailLink")}
        </p>
        `
    );

    $("#alert-first-button")
        .html(i18n.t("dialogs.btnOk"))
        .unbind("click")
        .click(() => closeAlertDialog());

    $alertOverlay.find(".dialog-wrapper").show();
    $alertOverlay.show();

}

function openResendEmailPage() {
    closeAlertDialog();
    $("#resend-email-page").show();
}

function closeResendEmailPage() {
    $("#resend-email-page").scrollTop(0).hide();
    $("#resend-email").val("");
}

function resendConfirmationEmail() {

    openLoader();

    let email = $("#resend-email").val();

    if (email === "") {
        closeLoader();
        logOrToast(i18n.t("messages.mandatoryEmail"), "long");
        return;
    }

    fetch(serverUrl + "auth/confirmation/resend", {
        method : "POST",
        headers: {
            "App-Key"     : APIKey,
            "Content-Type": "application/json",
        },
        body   : JSON.stringify({
            email: email
        })
    })
        .then(res => {

            if (res.status !== 201) {
                const err = new Error();
                err.code  = res.status;
                throw err;
            }

            closeResendEmailPage();
            closeLoader();
            logOrToast(i18n.t("messages.confirmEmailResendSuccess"), "long");
        })
        .catch(err => {
            console.error(err);
            closeLoader();

            if (err.code === 403) {
                closeResendEmailPage();
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
                    i18n.t("dialogs.btnOk"));
            } else if (err.code === 404)
                createAlertDialog(
                    i18n.t("dialogs.title404"),
                    i18n.t("dialogs.resendConfEmail404"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 409) {
                closeResendEmailPage();
                createAlertDialog(
                    i18n.t("dialogs.titleResendConfEmail409"),
                    i18n.t("dialogs.resendConfEmail409"),
                    i18n.t("dialogs.btnOk"));
            } else if (err.code === 422)
                logOrToast(i18n.t("messages.mandatoryEmail"), "long");
            else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.resendConfEmail500"),
                    i18n.t("dialogs.btnOk"));
        })

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
        headers: {
            "App-Key"     : APIKey,
            "Content-Type": "application/json",
        },
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

            if (!hasLoggedOut)
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
            else if (err.code === 403)
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 460)
                createResendEmailDialog();
            else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.login500"),
                    i18n.t("dialogs.btnOk"));
        })

}


function logout() {

    hasLoggedOut = true;
    isAuth       = false;
    token        = null;
    userId       = null;

    localStorage.removeItem("token");
    localStorage.removeItem("expireDate");
    localStorage.removeItem("userId");

}

function setAutoLogout(milliseconds) {
    setTimeout(() => logout(), milliseconds)
}


function closeResetPwPage() {
    $("#reset-pw").scrollTop(0).hide();
    $("#reset-pw-email").val("");
}

function resetPassword() {

    openLoader();

    let email = $("#reset-pw-email").val();

    if (email === "") {
        closeLoader();
        logOrToast(i18n.t("messages.mandatoryEmail"), "long");
        return;
    }

    fetch(serverUrl + "auth/reset-password", {
        method : "POST",
        headers: {
            "App-Key"     : APIKey,
            "Content-Type": "application/json",
        },
        body   : JSON.stringify({
            email: email
        })
    })
        .then(res => {

            if (res.status !== 201) {
                const err = new Error();
                err.code  = res.status;
                throw err;
            }

            closeResetPwPage();
            closeLoader();

            createAlertDialog(
                i18n.t("auth.login.resetPassword.successTitle"),
                i18n.t("auth.login.resetPassword.successMessage"),
                i18n.t("dialogs.btnOk"));
        })
        .catch(err => {
            console.error(err);
            closeLoader();

            if (err.code === 403) {
                closeResetPwPage();
                createAlertDialog(
                    i18n.t("dialogs.title403"),
                    i18n.t("dialogs.message403"),
                    i18n.t("dialogs.btnOk"));
            } else if (err.code === 404)
                createAlertDialog(
                    i18n.t("dialogs.title404"),
                    i18n.t("dialogs.resetPw404"),
                    i18n.t("dialogs.btnOk"));
            else if (err.code === 422)
                logOrToast(i18n.t("messages.mandatoryEmail"), "long");
            else
                createAlertDialog(
                    i18n.t("dialogs.title500"),
                    i18n.t("dialogs.resetPw500"),
                    i18n.t("dialogs.btnOk"));
        });

}