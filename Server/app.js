"use strict";

const path = require("path"),
      fs   = require("fs");

const express    = require("express"),
      bodyParser = require("body-parser"),
      mongoose   = require("mongoose"),
      multer     = require("multer"),
      uuidv4     = require("uuid/v4"),
      helmet     = require("helmet"),
      morgan     = require("morgan");

const defibrillatorRoutes = require("./routes/defibrillator"),
      authRoutes          = require("./routes/auth"),
      profileRoutes       = require("./routes/profile");

const app = express();


// Multer config
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let ifParam   = req.query.if,
            imgFolder = "images";

        if (ifParam === "def")
            imgFolder = "images/defibrillatorPhotos";
        else if (ifParam === "prof")
            imgFolder = "images/profilePhotos";

        cb(null, imgFolder);
    },
    filename   : (req, file, cb) => cb(null, uuidv4())
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg")
        cb(null, true);
    else
        cb(null, false);
};

// Set the file on which save the logs
// const accessLogStream = fs.createWriteStream(path.join(__dirname, "logs/server.log"), { flags: "a" });

// Set ejs as template engine (for email confirmation and reset password pages)
app.set("view engine", "ejs");
app.set("views", "views");

// Use helmet to set secure response headers
app.use(helmet());

// Use morgan for request logging
// app.use(morgan("combined", { stream: accessLogStream }));

// Parse for application/json
app.use(bodyParser.json());

// Use multer to upload images
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));

// Serve statically the images form the "images" folder
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.static(path.join(__dirname, "public")));

// Set headers for CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, App-Key");

    next();
});

app.use("/defibrillator", defibrillatorRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
    const status  = error.statusCode || 500,
          message = error.message,
          errors  = error.errors || [];

    res.status(status).json({ message: message, errors: errors });
});


mongoose
    .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true })
    .then(() => app.listen(process.env.PORT || 8080))
    .catch(err => console.error(err));