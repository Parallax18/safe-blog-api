const mongoose = require("mongoose");
const schema = new mongoose.Schema(
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
    comments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    },
  },
  { timestamps: true }
);

const post = new mongoose.model("Post", schema);
module.exports = post;
