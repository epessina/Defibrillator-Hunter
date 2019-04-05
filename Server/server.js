"use strict";

const express = require("express"),
      app     = express();

const port = process.env.PORT || 5000;

const routes = require("./routes");


app.use(routes);

app.set("port", port).listen(port, () => console.log("Server running on port " + port));

