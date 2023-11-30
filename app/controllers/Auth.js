const UserModel = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: 3 * 24 * 60 * 60,
  });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email && !password) {
    res.status(400).send({ message: "Content can not be empty!" });
  }
  try {
    const user = await UserModel.findOne({ email: "superadmin@email.com" });
    if (!user) {
      return res.json({ message: "User is not an admin" });
    }

    if (password !== "superadmin") {
      return res.status(400).json({ message: "Incorrect password or email" });
    }
    const token = createToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res
      .status(201)
      .json({ message: "Admin logged in successfully", data: user, token });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
