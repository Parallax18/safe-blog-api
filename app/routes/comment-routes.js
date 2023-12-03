const express = require("express");
const CommentController = require("../controllers/Comment.js");
const router = express.Router();
router.patch("/:id/flag", CommentController.flagComment);
module.exports = router;
