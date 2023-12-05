const mongoose = require("mongoose");
const CommentModel = require("../models/comment.js");
const UserModel = require("../models/user.js");
const PostModel = require("../models/post.js");
const { spawn } = require("child_process");

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

// Function to handle both checking and flagging a comment
async function checkAndFlagComment(comment, res) {
  try {
    // Call the Python script for prediction
    const predictScript = spawn("python3", ["app/ml/predict.py", comment.body]);

    predictScript.stdout.on("data", async (data) => {
      const predictionResult = JSON.parse(data.toString());
      console.log(predictionResult);

      if (predictionResult.result[0] === 1) {
        // If the comment is predicted as bad, flag it
        await flagComment(comment._id, comment.author, res);
      } else {
        // If the comment is not bad, proceed with the normal response
        res.status(200).send({ message: "Comment saved", data: comment });
      }
    });

    predictScript.stderr.on("data", (data) => {
      console.error(`Error in Python script: ${data}`);
      res.status(500).json({ error: "Internal server error" });
    });

    predictScript.on("close", (code) => {
      console.log(`Prediction process exited with code ${code}`);
    });

    // Capture errors in the child process
    predictScript.on("error", (err) => {
      console.error(`Error in child process: ${err}`);
      res.status(500).json({ error: "Internal server error" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function to flag a comment
async function flagComment(commentId, author, res) {
  const authorId = author._id; // Assuming author is a User model instance

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await UserModel.findById(authorId).session(session);

    // Check if the user exists
    if (!user) {
      throw new Error("User not found");
    }

    if (user.flags < 4) {
      user.flags += 1;
      await user.save();
    }

    // Update the comment
    const updatedComment = await CommentModel.findByIdAndUpdate(
      commentId,
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
}

// Endpoint to post a comment
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
    await savedComment.populate("author");

    // Update the post with the new comment
    const updatedPost = await PostModel.findByIdAndUpdate(
      post_id,
      { $push: { comments: savedComment._id } },
      { new: true, useFindAndModify: false }
    ).populate("comments comments.author");

    await savedComment.populate("author");

    // Call the function to check and flag the comment
    await checkAndFlagComment(savedComment, res);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error saving comment" });
  }
};
