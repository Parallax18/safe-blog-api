const mongoose = require("mongoose");
const CommentModel = require("../models/comment.js");
const UserModel = require("../models/user.js");
const PostModel = require("../models/post.js");

exports.create = async (req, res) => {
  const { author, body } = req.body;
  const { post_id } = req.params;

  if (!author || !body || !post_id) {
    res.status(400).send({ message: "Missing values!" });
    return;
  }

  const comment = new CommentModel({
    author,
    body,
  });

  try {
    // Save the comment
    const savedComment = await comment.save();

    // Update the post with the new comment
    const updatedPost = await PostModel.findByIdAndUpdate(
      post_id,
      { $push: { comments: savedComment._id } },
      { new: true, useFindAndModify: false }
    ).populate("comments");

    await PostModel.populate(updatedPost, { path: "comments.author" });

    res.status(200).send({ message: "Comment saved", data: updatedPost });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error saving comment" });
  }
};

exports.reply = async (req, res) => {
  const { author, body } = req.body;
  const { post_id, comment_id } = req.params;

  if (!author || !body || !post_id || !comment_id) {
    res.status(400).send({ message: "Missing values!" });
    return;
  }

  const reply = new CommentModel({
    author,
    body,
  });

  try {
    const savedReply = await reply.save();

    const updatedComment = await CommentModel.findByIdAndUpdate(
      comment_id,
      { $push: { replies: savedReply._id } },
      { new: true, useFindAndModify: false }
    );

    await CommentModel.populate(updatedComment, { path: "author" });
    await CommentModel.populate(updatedComment, { path: "replies" });
    await CommentModel.populate(updatedComment, {
      path: "replies.author",
    });

    res.status(200).send({ message: "Reply saved", data: updatedComment });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error saving reply" });
  }
};

exports.flagComment = async (req, res) => {
  const { id, author } = req.params;
  const { author_id } = req.body;

  if (!author_id) {
    res.status(400).send("Author must be provided!");
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await UserModel.findById(author_id).session(session);

    // Check if the user exists
    if (!user) {
      throw new Error("User not found");
    }

    if (user.flags < 3) {
      user.flags += 1;
      await user.save();
    }
    // Update the comment
    const updatedComment = await CommentModel.findByIdAndUpdate(
      id,
      { isFlagged: true },
      { new: true, useFindAndModify: false, session }
    );

    if (!updatedComment) {
      throw new Error("Comment not found");
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).send({
      message: "Comment flagged",
      data: { comment: updatedComment, user },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).send({
      message: err.message || "Error flagging comment",
    });
  }
};
