const mongoose = require("mongoose");
const { commentSchema } = require("./post");
const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    first_name: {
      type: String,
      default: "",
    },
    last_name: {
      type: String,
      default: "",
    },
    password: {
      type: String,
    },
    flags: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "active",
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);
const user = new mongoose.model("User", schema);
module.exports = user;
