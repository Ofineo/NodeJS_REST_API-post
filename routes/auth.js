const express = require("express");
const router = express.Router();

const isAuth = require("../middleware/is-auth");
const User = require("../models/user");
const authController = require("../controllers/auth");

const { body } = require("express-validator");

router.put(
  "/signup",
  [
    body("name").not().isEmpty(),
    body("email")
      .isEmail()
      .withMessage("please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) return Promise.reject("Email address in use already");
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
  ],
  authController.signup
);

router.post(
  "/login",
  [
    body("email").not().isEmpty().isEmail().normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
  ],
  authController.postLogin
);

router.get("/status", isAuth, authController.getStatus);

router.put(
  "/status",
  [body("status").trim().not().isEmpty()],
  isAuth,
  authController.putStatus
);

module.exports = router;
