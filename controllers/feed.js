const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const io = require("../socket");

const Post = require("../models/post");
const User = require("../models/user");
const constants = require("constants");

exports.getFeed = async (req, res, next) => {
  const page = req.query.page || 1;
  const itemsPerPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);
    if (!posts) {
      const error = new Error("could not find the post");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "posts fetched successfully",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed, entered data has errors");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("no image provided");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const imageUrl = req.file.path.replace("\\", "/");
  const content = req.body.content;
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post); //mongoose will do all the heavy lifting of attaching the post id to the user model
    await user.save();
    io.getIO().emit("posts", {
      action: "create",
      post: { ...post.doc, creator: { _id: req.userId, name: user.name } },
    });
    res.status(201).json({
      message: "post created successfully",
      post: post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = err.message;
    }
    next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("could not find the post");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "post fetched successfully",
      post: post,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed, entered data has errors");
    error.statusCode = 422;
    throw error;
  }
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) imageUrl = req.file.path;
  if (!imageUrl) {
    const error = new Error("the image is missing");
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await (await Post.findById(postId)).populate("creator");
    if (!post) {
      const error = new Error("could not find the post");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("not authorized");
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) clearImage(post.imageUrl);
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    await post.save();
    io.getIO.emit("posts", { action: "update", post: post });
    res.status(200).json({ message: "post updated", post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("could not find the post");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("not authorized");
      error.statusCode = 403;
      throw error;
    }
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    res.status(200).json({ message: "deleted post" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
