const PostModel = require("../models/post.js");

exports.create = async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    res.status(400).send({ message: "Missing values!" });
  }

  const post = new PostModel({
    title,
    body,
    sub_title: req.body.sub_title,
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
    const post = await PostModel.find();
    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
// Find a single post with an id
exports.findOne = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
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
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `post not found.`,
        });
      } else {
        res.send({ message: "post updated successfully." });
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
