const mongoose = require("mongoose");
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
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);
const user = new mongoose.model("User", schema);
module.exports = user;
