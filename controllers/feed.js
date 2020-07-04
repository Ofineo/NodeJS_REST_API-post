const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");

const Post = require("../models/post");
const User = require("../models/user");

exports.getFeed = (req, res, next) => {
  const page = req.query.page || 1;
  const itemsPerPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((totalDocuments) => {
      totalItems = totalDocuments;
      return Post.find()
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage);
    })
    .then((posts) => {
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
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postPost = (req, res, next) => {
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
  let creator;
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId,
  });
  console.log(post, req.userId);
  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post); //mongoose will do all the heavy lifting of attaching the post id to the user model
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "post created successfully",
        post: post,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPosts = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("could not find the post");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: "post fetched successfully",
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
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
  Post.findById(postId)
    .then((post) => {
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
      if (imageUrl !== post.imageUrl) clearImage(post.imageUrl);
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "post updated", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
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
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "deleted post" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
