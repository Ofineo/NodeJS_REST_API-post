const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const MONGODB_URI =
  "mongodb+srv://nodeComplete:rYX7GHW1EobK0XFw@node-complete-5hx8z.mongodb.net/messages?retryWrites=true&w=majority";

const feedRoutes = require("./routes/feed");
const indexRoutes = require("./routes/index");

const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

//static serving of folder to serve images
app.use("/images", express.static(path.join(__dirname, "images")));
//CORS setup
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use(indexRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
