const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  body: {
    type: String,
    required: true,
    default: "",
  },
});

const commentSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  body: {
    type: String,
    required: true,
    default: "",
  },
  replies: [replySchema],
});

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    sub_title: {
      type: String,
    },
    body: {
      type: String,
      required: true,
      default: "",
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);

const post = new mongoose.model("Post", postSchema);
module.exports = post;
