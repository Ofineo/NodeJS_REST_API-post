const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getFeed = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        title: "First post",
        content: "post content",
        image: "images/book.png",
        creator: { name: "jordi" },
        createdAt: new Date(),
        _id: "1",
      },
    ],
  });
};

exports.postPost = (req, res, next) => {
  const errors = validationResult(req);
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const content = req.body.content;
  const creator = req.body.creator;
  //TO DO create post in the db
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: "validation failed, entered data has errors",
      errors: errors.array(),
    });
  }
  const post = new Post({
    title: title,
    imageUrl: "imageUrl",
    content: content,
    creator: { name: "jordi" },
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "post created successfully",
        post: result,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
