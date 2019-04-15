"use strict";

const express = require("express");

const defibrillatorController = require("../controllers/defibrillator");

const router = express.Router();


// GET /defibrillator/get-all
router.get("/get-all", defibrillatorController.getDefibrillators);

// POST /defibrillator/post
router.post("/post", defibrillatorController.postDefibrillator);


module.exports = router;