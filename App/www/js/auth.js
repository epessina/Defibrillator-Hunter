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
    //     logOrToast("You must provide a valid email address.", "short");
    //     return;
    // }
    //
    // if (password === "" || password.length < 8 || !(/\d/.test(password))) {
    //     logOrToast("Password should be of at least 8 characters long and must contain at least a number.", "short");
    //     return;
    // }
    //
    // if (password !== confirmPassword) {
    //     logOrToast("Passwords don't match.", "short");
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
            if (res.status === 422)
                throw new Error("Invalid email and/or password.");

            if (res.status !== 202)
                throw new Error("Validating email and password failed failed.");

            $("#register-page-two").show();
            closeLoader();
        })
        .catch(err => {
            closeLoader();
            console.error(err);
        });

}


function login() {

    openLoader();

    let email    = $("#login-email").val(),
        password = $("#login-password").val();

    if (email === "" || password === "") {
        logOrToast("Please provide valid credentials.", "short");
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
            if (res.status === 401)
                throw new Error("Wrong email or password");

            if (res.status !== 200 && res.status !== 201)
                throw new Error("Authentication failed");

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
        })

}


function logout() {

    isAuth = false;
    token  = null;
    userId = null;

    localStorage.removeItem('token');
    localStorage.removeItem('expiryDate');
    localStorage.removeItem('userId');

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
            if (res.status === 422)
                throw new Error("Validation failed.");

            if (res.status !== 200 && res.status !== 201)
                throw new Error("Creating user failed.");

            return res.json();
        })
        .then(resData => {
            console.log(resData);
            closeLoader();
            closeRegistrationPage();
        })
        .catch(err => {
            console.error(err);
            closeLoader();
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