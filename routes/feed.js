const express = require("express");

const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

const feedController = require("../controllers/feed");

router.get("/posts", isAuth, feedController.getFeed);
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],isAuth,
  feedController.postPost
);
router.get("/post/:postId", isAuth, feedController.getPosts);

router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  feedController.updatePost
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
