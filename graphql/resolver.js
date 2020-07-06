const User = require("../models/user");
const Post = require("../models/post");
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

  login: async function ({ email, password }, req) {
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
        userId: user._id.toString(),
        email: user.email,
      },
      constants.jwtSecret,
      { expiresIn: "1h" }
    );

    return { token: token, userId: user._id.toString() };
  },

  createPost: async function ({ postInput }, req) {
    console.log(postInput,req.userId, req.isAuth);
    if (!req.isAuth) {
      const error = new Error("Not Authenticated.");
      error.statusCode = 401;
      throw error;
    }
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid." });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content empty or too short!" });
    }
    console.log(errors)
    if (errors.length > 0) {
      const error = new Error("invalid input.");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    console.log('looking for the user')
    const user = await User.findById(req.userId);
    if(!user){
      const error = new Error("invalid user.");
      error.data = errors;
      error.code = 401;
      throw error;
    }
    console.log(user);
    const post = new Post({
      title: postInput.title,
      imageUrl: postInput.imageUrl,
      content: postInput.content,
      creator: user,
    });
    const newPost = await post.save();
    user.posts.push(newPost);
    await user.save();
    return {
      ...newPost._doc,
      _id: newPost._id.toString(),
      createdAt: newPost.createdAt.toISOString(),
      updatedAt: newPost.updatedAt.toISOString(),
    };
  },
};
