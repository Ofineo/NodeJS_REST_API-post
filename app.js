const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const MONGODB_URI =
  "mongodb+srv://nodeComplete:rYX7GHW1EobK0XFw@node-complete-5hx8z.mongodb.net/messages?retryWrites=true&w=majority";

const feedRoutes = require("./routes/feed");
const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");

const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
//multer setting up
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, `${Math.random()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use(bodyParser.json());

//static serving of folder to serve images
app.use("/images", express.static(path.join(__dirname, "images")));
//CORS setup
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use("/feed", feedRoutes);
app.use(indexRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    const server = app.listen(8080);
    const io = require("./socket.io").init(server);
    io.on("connection", (socket) => {
      console.log("client socket connected");
    });
  })
  .catch((err) => {
    console.log(err);
  });
