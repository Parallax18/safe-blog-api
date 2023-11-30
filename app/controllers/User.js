const UserModel = require("../models/user.js");
// Create and Save a new user
exports.create = async (req, res) => {
  if (!req.body.email && !req.body.first_name && !req.body.last_name) {
    res.status(400).send({ message: "Content can not be empty!" });
  }

  const user = new UserModel({
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    ...(req.body.email === "superadmin@email.com" && {
      password: req.body.password,
    }),
  });

  await user
    .save()
    .then((data) => {
      res.send({
        message: "User created successfully!!",
        user: data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating user",
      });
    });
};
// Retrieve all users from the database.
exports.findAll = async (req, res) => {
  try {
    const users = await UserModel.find();
    res
      .status(200)
      .json(users.filter((i) => i.email !== "superadmin@email.com"));
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
// Find a single User with an id
exports.findOne = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
// Update a user by the id in the request
exports.update = async (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  await UserModel.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `User not found.`,
        });
      } else {
        res.send({ message: "User updated successfully." });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
};
// Delete a user with the specified id in the request
exports.destroy = async (req, res) => {
  await UserModel.findByIdAndRemove(req.params.id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `User not found.`,
        });
      } else {
        res.send({
          message: "User deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
};

exports.flaguser = async (req, res) => {
  const { id, method } = req.params;

  const user = await UserModel.findById(id);

  const getFlags = () => {
    if (method === "unflag" && user.flags !== 0) {
      return user.flags - 1;
    }
    if (method === "flag" && user.flags !== 3) {
      return user.flags + 1;
    }
  };

  await UserModel.findByIdAndUpdate(
    id,
    {
      ...req.body,
      flags: getFlags(),
    },
    { useFindAndModify: false }
  )
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `User not found.`,
        });
      } else {
        res.send({ message: "User flags updated successfully.", data });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
};
