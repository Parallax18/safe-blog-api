const express = require("express");
const UserController = require("../controllers/User.js");
const authenticate = require("../middlewares/auth.middleware.js");
const router = express.Router();
router.get("/", UserController.findAll);
router.get("/:id", UserController.findOne);
router.post("/", UserController.create);
router.patch("/:id", UserController.update);
router.patch("/:id/:method", authenticate, UserController.flaguser);
router.delete("/:id", UserController.destroy);
module.exports = router;
