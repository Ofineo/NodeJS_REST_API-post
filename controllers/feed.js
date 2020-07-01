exports.getFeed = (req, res, next) => {
  res.status(200).json({ response: "feed" });
};

exports.postPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  //TO DO create post in the db
  res.status(201).json({
    message: "post created successfully",
    post: { id: new Date().toISOString, title: title, content: content },
  });
};
