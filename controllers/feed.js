const { validationResult } = require("express-validator");

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
  const content = req.body.content;
  //TO DO create post in the db
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: "validation failed, entered data has errors",
      errors: errors.array(),
    });
  }
  res.status(201).json({
    message: "post created successfully",
    post: {
      _id: new Date().toISOString,
      title: title,
      content: content,
      imageUrl: "",
      creator: { name: "jordi" },
      createdAt: new Date(),
    },
  });
};
