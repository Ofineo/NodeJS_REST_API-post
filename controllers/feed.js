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
  const title = req.body.title;
  const content = req.body.content;
  //TO DO create post in the db
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
