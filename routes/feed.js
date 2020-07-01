const express = require("express");

const router = express.Router();

const feedController = require("../controllers/feed");

router.get("/posts", feedController.getFeed);
router.post("/posts", feedController.postPost);

module.exports = router;
