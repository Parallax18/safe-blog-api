const PostModel = require("../models/post.js");
const CommentModel = require("../models/comment.js");

const populateReplies = async (comment) => {
  await CommentModel.populate(comment, { path: "replies" });

  for (const reply of comment.replies) {
    await populateReplies(reply);
    await CommentModel.populate(reply, { path: "author" }); // Populate author of the reply
  }
};

exports.create = async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    res.status(400).send({ message: "Missing values!" });
  }

  const post = new PostModel({
    title,
    body,
    sub_title: req.body.sub_title,
    comments: req.body.comments,
  });

  await post
    .save()
    .then((data) => {
      res.send({
        message: "Post created successfully!!",
        data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating post",
      });
    });
};

// Retrieve all posts from the database.
exports.findAll = async (req, res) => {
  try {
    const posts = await PostModel.find().lean();

    for (const post of posts) {
      post.comments = await CommentModel.find({ _id: { $in: post.comments } })
        .populate("author")
        .lean();

      for (const comment of post.comments) {
        await populateReplies(comment);
      }
    }
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Find a single post with an id
exports.findOne = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id).lean();
    post.comments = await CommentModel.find({ _id: { $in: post.comments } })
      .populate("author replies replies.author")
      .lean();

    for (const comment of post.comments) {
      await populateReplies(comment);
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
// Update a post by the id in the request
exports.update = async (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  await PostModel.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(async (data) => {
      if (!data) {
        res.status(404).send({
          message: `post not found.`,
        });
      } else {
        const populatedPost = await PostModel.findById(id);
        await PostModel.populate(post, { path: "comments" });

        await PostModel.populate(populatedPost, { path: "comments.author" });
        await PostModel.populate(populatedPost, {
          path: "comments.replies",
        });
        await PostModel.populate(populatedPost, {
          path: "comments.replies.author",
        });

        res.send({
          message: "post updated successfully.",
          data:
            data.comments && data.comments.length > 0 ? populatedPost : data,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
};

// Delete a post with the specified id in the request
exports.destroy = async (req, res) => {
  await PostModel.findByIdAndRemove(req.params.id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `post not found.`,
        });
      } else {
        res.send({
          message: "post deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
};
