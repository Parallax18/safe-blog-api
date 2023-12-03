const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    body: {
      type: String,
      required: [true, "Comment content must be provided"],
      default: "",
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

const comment = new mongoose.model("Comment", commentSchema);
module.exports = comment;
