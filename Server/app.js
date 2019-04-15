"use strict";

const express    = require("express"),
      bodyParser = require("body-parser");

const defibrillatorRoutes = require("./routes/defibrillator");

const app = express();


// Parse for application/json
app.use(bodyParser.json());

// Set headers for CORS
app.use((req, res, next) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    next();

});

app.use("/defibrillator", defibrillatorRoutes);


let port = process.env.PORT;

if (port == null || port == "")
    port = 8080;

app.listen(port);