exports.getFeed = (req, res, next) => {
  res.status(200).json({ response: "feed" });
};


exports.postPost = (req, res, next) => {
  //TO DO create post in the db
  const title = req.body.title;
  const content = req.body.content;
  res
    .status(200)
    .json({
      message: "post created successfully",
      post: { id: new Date().toISOString, title: title, content: content },
    });
};
