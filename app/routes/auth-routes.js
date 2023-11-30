const AuthController = require("../controllers/Auth.js");
const express = require("express");
const router = express.Router();
router.post("/", AuthController.login);

module.exports = router;
