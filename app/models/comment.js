const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    body: {
      type: String,
      required: true,
      default: "",
    },
  },
  { timestamps: true }
);

const comment = new mongoose.model("Comment", schema);
module.exports = comment;
