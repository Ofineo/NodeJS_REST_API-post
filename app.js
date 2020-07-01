const express = require("express");

const feedRoutes = require("./routes/feed");

const indexRoutes = require("./routes/index");

const app = express();

app.use("/feed", feedRoutes);
app.use(indexRoutes);

app.listen(8080);
