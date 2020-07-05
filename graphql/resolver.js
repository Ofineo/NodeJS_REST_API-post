const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const constants = require("../constants/constants");

module.exports = {
  createUser: async function ({ userInput }, req) {
    // const email = args.userInput.email;
    //validation code
    const errors = [];
    if (!validator.isEmail(userInput.email))
      errors.push({ message: "Email is invalid." });
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "password empty or too short!" });
    }
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error("this email is assigned to a user already");
      error.statusCode = 401;
      throw error;
    }
    if (errors.length > 0) {
      const error = new Error("invalid input.");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPassword,
    });
    const newUser = await user.save();
    return { ...newUser._doc, _id: newUser._id.toString() };
  },

  login: async function ({ email, password }) {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("there is no user with that password.");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Authentification failed.");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: email,
        userId: user._id.toString(),
      },
      constants.jwtSecret,
      { expiresIn: "1h" }
    );

    return { token: token, userId: user._id.toString() };
  },
};
