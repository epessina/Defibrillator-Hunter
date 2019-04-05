"use strict";

const express    = require("express"),
      router     = express.Router(),
      bodyParser = require("body-parser");


router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.use(bodyParser.urlencoded({
    extended: true
}));

router.use(bodyParser.json());


router.get("/", function (req, res) {
    res.send("Defibrillator Hunter server");
});



module.exports = router;

